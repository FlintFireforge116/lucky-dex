#!/usr/bin/env python3
"""Focused Super Surfing Pikachu DX extractor for LuckyDex v0.53.0.

Reads either the user-supplied release ZIP or a GameMaker data.win, decodes
GameMaker's 2zoq/fioq texture pages, crops the sprites needed by the LuckyDex
port, extracts the release's WAV resources, and writes manifest.json.
"""
from __future__ import annotations
import argparse,bz2,io,json,re,struct,sys,zipfile
from pathlib import Path
from PIL import Image

SPRITE_PATTERNS=(
    r'^surfingpika$',r'^s_p_',r'^s_wave\d*$',r'^s_water\d*$',r'^s_ring',r'^s_hp(?:Up|Bar|$)',r'^s_progress$',r'^s_background$',r'^s_clouds',
    r'^s_seaking',r'^s_lapras',r'^s_natu',r'^s_friend',
    r'^s_wingull$',r'^s_mantine',r'^s_drifloon$',r'^s_octillery$',r'^s_toxapex$',r'^s_starmie',r'^s_voltorb$',r'^s_qwilfish$',r'^s_pelipper',r'^s_sharpedo$',r'^s_tentacruel',r'^s_tentacle$',r'^s_exlpode$',
    r'^s_articuno',r'^s_icebeam',r'^s_icePillar',r'^s_iceRipple$',
    r'^s_zapdos',r'^s_electro',r'^s_lightning$',
    r'^s_moltres',r'^s_moltress',r'^s_fire$',
    r'^s_lugia',r'^s_aeroblast',
    r'^s_wailord',r'^s_watergun',r'^s_hydropump$',r'^s_water_spout',r'^s_whilpool$',
    r'^s_bullet',r'^s_missle',r'^s_exlopsion$',r'^s_poof$',r'^s_charge$',r'^s_splash',r'^s_trail',r'^s_spinBonus$',r'^s_danger',r'^s_boss_hp_bar$'
)
REQUIRED={
    'surfingpika','s_wave','s_ring','s_hpUp','s_seaking1','s_lapras','s_natu1','s_wingull',
    's_articuno_0','s_zapdos_0','s_moltress_0','s_lugia_idle','s_wailord_idle'
}
AUDIO_REQUIRED={'a_surfing_pikachu_song','a_wave','a_playerJump','a_playerShoot','a_ironTail','a_collect','a_trick','a_playerHit','a_befriend'}
AUDIO_KEEP={
 'a_surfing_pikachu_song','a_surf_song_2','a_menu_song','a_wave','a_playerJump','a_playerShoot','a_ironTail','a_collect','a_trick','a_playerHit','a_playerDie','a_befriend','a_bonus','a_perfect','a_ok','a_menu','a_zoom','a_slow','a_siren',
 'a_bird','a_lightning','a_brine','a_wailord','a_explosion1','a_explosion2','a_explode','a_missile','a_natu','a_lugia','a_aeroblast','a_splash1','a_splashBig1','a_splashBig2','a_iceSpawn','a_iceDie','a_fire','a_watergun','a_hydropump','a_lapras1','a_lapras2','a_seaking','a_mantineZoom1','a_mantineZoom2','a_tentacruel','a_toxapex','a_voltorb','a_quilfish','a_sharpedo','a_starmie1','a_starmie2','a_gyarados','a_whirlpool','a_bounce1','a_bounce2','a_hit1','a_hit2','a_hit3','a_hit4','a_squeeze'
}

def u32(b,o): return struct.unpack_from('<I',b,o)[0]
def i32(b,o): return struct.unpack_from('<i',b,o)[0]
def cstr(b,o):
    e=b.find(b'\0',o)
    return b[o:e].decode('utf-8','replace')

def chunks(data:bytes):
    if data[:4]!=b'FORM': raise ValueError('not a GameMaker FORM data.win')
    pos=8; out={}
    while pos+8<=len(data):
        tag=data[pos:pos+4].decode('ascii','replace'); n=u32(data,pos+4); out[tag]=(pos+8,n); pos+=8+n
    return out

def sx(v,bits):
    x=v&((1<<bits)-1)
    return x-(1<<bits) if x&(1<<(bits-1)) else x

def pxhash(px):
    p=px[0]|px[1]<<8|px[2]<<16|px[3]<<24
    return (p^(p>>8)^(p>>16)^(p>>24))&63

def decompress_2zoq(data:bytes,pos:int):
    if data[pos:pos+4]!=b'2zoq': raise ValueError('texture blob is not 2zoq')
    off=12 if data[pos+12:pos+15]==b'BZh' else 8
    inp=data[pos+off:]; out=bytearray()
    while inp.startswith(b'BZh'):
        dec=bz2.BZ2Decompressor(); out.extend(dec.decompress(inp)); inp=dec.unused_data
        if not inp.startswith(b'BZh'): break
    return bytes(out)

def decode_fioq(q:bytes):
    if q[:4]!=b'fioq': raise ValueError('decompressed texture is not fioq')
    w=q[4]|q[5]<<8; h=q[6]|q[7]<<8; total=w*h
    p=12; px=[0,0,0,255]; idx=[[0,0,0,0] for _ in range(64)]; out=bytearray()
    while len(out)//4<total:
        b1=q[p]; p+=1; run=0; update=True
        if b1<0x40: px=idx[b1].copy(); update=False
        elif b1<0x60: run=b1&31; update=False
        elif b1<0x80:
            b2=q[p];p+=1;run=(((b1&31)<<8)|b2)+32;update=False
        elif b1<0xC0:
            px[0]=(px[0]+sx((b1>>4)&3,2))&255;px[1]=(px[1]+sx((b1>>2)&3,2))&255;px[2]=(px[2]+sx(b1&3,2))&255
        elif b1<0xE0:
            b2=q[p];p+=1;px[0]=(px[0]+sx(b1&31,5))&255;px[1]=(px[1]+sx((b2>>4)&15,4))&255;px[2]=(px[2]+sx(b2&15,4))&255
        elif b1<0xF0:
            b2=q[p];b3=q[p+1];p+=2
            dr=sx(((b1&15)<<1)|((b2>>7)&1),5);dg=sx(b2&127,7)>>2;db=sx(((b2&3)<<8)|b3,10)>>5;da=sx(b3&31,5)
            px=[(px[0]+dr)&255,(px[1]+dg)&255,(px[2]+db)&255,(px[3]+da)&255]
        else:
            m=b1&15
            if m&8: px[0]=q[p];p+=1
            if m&4: px[1]=q[p];p+=1
            if m&2: px[2]=q[p];p+=1
            if m&1: px[3]=q[p];p+=1
        if update: idx[pxhash(px)]=px.copy()
        out.extend(px)
        for _ in range(run):
            if len(out)//4>=total: break
            out.extend(px)
    return Image.frombytes('RGBA',(w,h),bytes(out[:total*4]))

def load_data(path:Path):
    if path.suffix.lower()=='.zip':
        with zipfile.ZipFile(path) as z: return z.read('data.win')
    return path.read_bytes()

def extract(input_path:Path,output:Path):
    data=load_data(input_path); c=chunks(data); output.mkdir(parents=True,exist_ok=True)
    # Texture pages: TXTR pointer table points to metadata records whose last pointer is 2zoq.
    txp,_=c['TXTR']; count=u32(data,txp); page_records=struct.unpack_from(f'<{count}I',data,txp+4)
    pages=[]
    for record in page_records:
        vals=struct.unpack_from('<7I',data,record)
        blob_ptr=next((v for v in reversed(vals) if 0<=v<len(data)-4 and data[v:v+4]==b'2zoq'),None)
        if blob_ptr is None: raise ValueError(f'no 2zoq pointer in TXTR record {record}')
        pages.append(decode_fioq(decompress_2zoq(data,blob_ptr)))
    # Sprite records.
    sp,_=c['SPRT']; scount=u32(data,sp); sprite_ptrs=struct.unpack_from(f'<{scount}I',data,sp+4)
    matchers=[re.compile(x) for x in SPRITE_PATTERNS]; assets=[]; selected=set()
    sprites_dir=output/'sprites';sprites_dir.mkdir(exist_ok=True)
    for rec in sprite_ptrs:
        name=cstr(data,u32(data,rec));
        if not any(r.search(name) for r in matchers): continue
        width,height=u32(data,rec+4),u32(data,rec+8)
        if i32(data,rec+56)!=-1: continue
        frame_count=u32(data,rec+84); frame_ptrs=struct.unpack_from(f'<{frame_count}I',data,rec+88) if frame_count else ()
        folder=sprites_dir/name;folder.mkdir(exist_ok=True); files=[]
        for fi,tp in enumerate(frame_ptrs):
            vals=struct.unpack_from('<11H',data,tp)
            sx0,sy0,sw,sh,tx,ty,tw,th,bw,bh,page=vals
            if page>=len(pages): raise ValueError(f'{name} frame {fi}: bad page {page}')
            crop=pages[page].crop((sx0,sy0,sx0+sw,sy0+sh))
            if crop.size!=(tw,th): crop=crop.resize((tw,th),Image.Resampling.NEAREST)
            canvas=Image.new('RGBA',(max(1,bw),max(1,bh)),(0,0,0,0)); canvas.alpha_composite(crop,(tx,ty))
            fp=folder/f'{fi:03}.png'; canvas.save(fp,optimize=True); files.append(f'arcade/pikachu-beach/dx/sprites/{name}/{fi:03}.png')
        if not files: continue
        selected.add(name)
        assets.append({'resource':name,'kind':'sprite','local':files[0],'frameFiles':files,'frames':len(files),'width':width,'height':height,'required':name in REQUIRED})
    missing=sorted(REQUIRED-selected)
    if missing: raise ValueError('required sprites not recovered: '+', '.join(missing))
    # Sounds: SOND records end with AUDO id. AUDO entries are length + RIFF bytes.
    ap,_=c['AUDO']; acount=u32(data,ap); aptrs=struct.unpack_from(f'<{acount}I',data,ap+4)
    sndp,_=c['SOND']; sndcount=u32(data,sndp); sndptrs=struct.unpack_from(f'<{sndcount}I',data,sndp+4)
    audio=[]; auddir=output/'audio';auddir.mkdir(exist_ok=True)
    for rec in sndptrs:
        name=cstr(data,u32(data,rec)); aid=u32(data,rec+32)
        if name not in AUDIO_KEEP or aid>=len(aptrs): continue
        ao=aptrs[aid]; n=u32(data,ao); blob=data[ao+4:ao+4+n]
        ext='.wav' if blob.startswith(b'RIFF') else '.bin'
        fp=auddir/(name+ext);fp.write_bytes(blob)
        audio.append({'resource':name,'kind':'audio','local':f'arcade/pikachu-beach/dx/audio/{fp.name}','bytes':len(blob),'required':name in AUDIO_REQUIRED})
    amissing=sorted(AUDIO_REQUIRED-{x['resource'] for x in audio})
    if amissing: raise ValueError('required audio not recovered: '+', '.join(amissing))
    manifest={'version':1,'source':'superSurfingPikachuDX_v1_1.zip','format':'GameMaker data.win','assets':sorted(assets,key=lambda x:x['resource']),'audio':sorted(audio,key=lambda x:x['resource'])}
    (output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    return manifest

def main():
    p=argparse.ArgumentParser();p.add_argument('input',type=Path);p.add_argument('output',type=Path);a=p.parse_args();m=extract(a.input,a.output);print(f"extracted {len(m['assets'])} sprite resources and {len(m['audio'])} audio resources")
if __name__=='__main__': main()
