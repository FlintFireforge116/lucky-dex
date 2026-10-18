package com.example.luckydex;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ConsoleMessage;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.graphics.Color;
import android.util.Log;
import android.view.WindowInsets;
import android.net.Uri;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();
    private static final String CARD_ART_HOST = "luckydex.local";
    private static final String CARD_ART_PREFIX = "/card-art/";
    private static final long MAX_CARD_ART_ZIP_BYTES = 350L * 1024L * 1024L;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        getWindow().setStatusBarColor(Color.rgb(5, 12, 24));
        getWindow().setNavigationBarColor(Color.rgb(5, 12, 24));
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(5, 12, 24));
        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        root.addView(webView, webParams);
        setContentView(root);
        // Android 15 edge-to-edge includes the system bars in the window. Padding the
        // WebView does not move CSS fixed-position elements, so fixed nav/game controls
        // could still sit underneath Samsung's status/navigation bars. Resize the actual
        // WebView viewport with margins instead; 100dvh and fixed positioning then use
        // the genuinely usable app area.
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) webView.getLayoutParams();
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                lp.setMargins(safe.left, safe.top, safe.right, safe.bottom);
            } else {
                lp.setMargins(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            webView.setLayoutParams(lp);
            return insets;
        });
        root.requestApplyInsets();
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setAllowFileAccess(true);
        // Lucky Dex is a packaged, non-navigable local app. Keep the existing
        // file:// origin so upgrades retain the user's localStorage save, while
        // allowing its bundled JavaScript to reach HTTPS metadata/image sources.
        @SuppressWarnings("deprecation")
        boolean legacyFileOrigin = true;
        s.setAllowFileAccessFromFileURLs(legacyFileOrigin);
        s.setAllowUniversalAccessFromFileURLs(legacyFileOrigin);
        s.setBlockNetworkLoads(false);
        s.setBlockNetworkImage(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.clearCache(true);
        webView.setWebViewClient(new LuckyDexWebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                Log.println(message.messageLevel() == ConsoleMessage.MessageLevel.ERROR ? Log.ERROR : Log.DEBUG,
                    "LuckyDexWebView", message.sourceId() + ":" + message.lineNumber() + " " + message.message());
                return true;
            }
        });
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
    }

    private File cardArtRoot() {
        File root = new File(getFilesDir(), "card_art_v1");
        if (!root.exists()) root.mkdirs();
        return root;
    }

    private static boolean safeKey(String value) {
        return value != null && value.matches("[A-Za-z0-9._-]{1,80}");
    }

    private static String readUtf8(File file) throws Exception {
        try (InputStream in = new FileInputStream(file); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buf = new byte[8192]; int n;
            while ((n = in.read(buf)) >= 0) out.write(buf, 0, n);
            return out.toString(StandardCharsets.UTF_8.name());
        }
    }

    private static String normalizeName(String value) {
        if (value == null) return "";
        String s = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "").toLowerCase(Locale.ROOT)
            .replace("pokémon", "pokemon")
            .replaceAll("[^a-z0-9]+", " ").trim();
        return s;
    }

    private static String normalizeNumber(String value) {
        String raw = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (raw.matches("0*\\d+")) {
            try { return String.valueOf(Long.parseLong(raw)); } catch (Exception ignored) { }
        }
        return raw.replaceAll("[^A-Z0-9]", "");
    }

    private static String sha256(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream in = new BufferedInputStream(new FileInputStream(file))) {
            byte[] buf = new byte[16384]; int n;
            while ((n = in.read(buf)) >= 0) digest.update(buf, 0, n);
        }
        StringBuilder sb = new StringBuilder();
        for (byte b : digest.digest()) sb.append(String.format(Locale.ROOT, "%02x", b & 0xff));
        return sb.toString();
    }

    private static void deleteRecursive(File file) {
        if (file == null || !file.exists()) return;
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) for (File child : children) deleteRecursive(child);
        }
        file.delete();
    }

    private WebResourceResponse localCardArtResponse(Uri uri) {
        try {
            if (uri == null || !"https".equalsIgnoreCase(uri.getScheme()) || !CARD_ART_HOST.equalsIgnoreCase(uri.getHost())) return null;
            String path = uri.getPath();
            if (path == null || !path.startsWith(CARD_ART_PREFIX)) return null;
            String rel = path.substring(CARD_ART_PREFIX.length());
            String[] parts = rel.split("/", 2);
            if (parts.length != 2) return null;
            String setKey = Uri.decode(parts[0]);
            String filePart = Uri.decode(parts[1]);
            if (!safeKey(setKey) || filePart.contains("..")) return null;
            File setDir = new File(cardArtRoot(), setKey);
            File target = new File(setDir, filePart);
            String rootPath = setDir.getCanonicalPath() + File.separator;
            if (!target.getCanonicalPath().startsWith(rootPath) || !target.isFile()) return null;
            String lower = target.getName().toLowerCase(Locale.ROOT);
            String mime = lower.endsWith(".webp") ? "image/webp" : lower.endsWith(".png") ? "image/png" : lower.endsWith(".jpg") || lower.endsWith(".jpeg") ? "image/jpeg" : lower.endsWith(".json") ? "application/json" : "application/octet-stream";
            return new WebResourceResponse(mime, null, new FileInputStream(target));
        } catch (Exception ignored) {
            return null;
        }
    }

    private class LuckyDexWebViewClient extends WebViewClient {
        @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            // The app has its own router. A link cannot replace the save origin.
            return true;
        }
        @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            WebResourceResponse local = localCardArtResponse(request == null ? null : request.getUrl());
            return local != null ? local : super.shouldInterceptRequest(view, request);
        }

        @SuppressWarnings("deprecation")
        @Override public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            try {
                WebResourceResponse local = localCardArtResponse(url == null ? null : Uri.parse(url));
                return local != null ? local : super.shouldInterceptRequest(view, url);
            } catch (Exception ignored) {
                return super.shouldInterceptRequest(view, url);
            }
        }
    }

    private JSONObject installCardArtZip(String requestedSetKey, File zipFile) throws Exception {
        if (!safeKey(requestedSetKey)) throw new IllegalArgumentException("invalid set key");
        File tempRoot = new File(getCacheDir(), "card_art_install_" + System.nanoTime());
        File unpack = new File(tempRoot, requestedSetKey);
        if (!unpack.mkdirs()) throw new IllegalStateException("could not create install directory");
        String prefix = requestedSetKey + "/";
        boolean wroteManifest = false;
        int files = 0;
        long expandedBytes = 0L;

        try (ZipInputStream zis = new ZipInputStream(new BufferedInputStream(new FileInputStream(zipFile)))) {
            ZipEntry entry;
            byte[] buf = new byte[16384];
            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName().replace('\\', '/');
                if (!name.startsWith(prefix)) { zis.closeEntry(); continue; }
                String relative = name.substring(prefix.length());
                if (relative.isEmpty()) { zis.closeEntry(); continue; }
                File target = new File(unpack, relative);
                String rootPath = unpack.getCanonicalPath() + File.separator;
                if (!target.getCanonicalPath().startsWith(rootPath)) throw new SecurityException("unsafe ZIP entry");
                if (entry.isDirectory()) {
                    target.mkdirs();
                } else {
                    File parent = target.getParentFile(); if (parent != null) parent.mkdirs();
                    try (BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(target))) {
                        int n;
                        while ((n = zis.read(buf)) >= 0) {
                            expandedBytes += n;
                            if (expandedBytes > MAX_CARD_ART_ZIP_BYTES * 3L) throw new IllegalStateException("expanded card-art pack is too large");
                            out.write(buf, 0, n);
                        }
                    }
                    files++;
                    if ("manifest.json".equals(relative)) wroteManifest = true;
                }
                zis.closeEntry();
            }
        }
        if (!wroteManifest) throw new IllegalStateException("set pack has no manifest.json");
        JSONObject manifest = new JSONObject(readUtf8(new File(unpack, "manifest.json")));
        JSONArray cards = manifest.optJSONArray("cards");
        if (cards == null || cards.length() == 0) throw new IllegalStateException("set manifest has no cards");
        for (int i = 0; i < cards.length(); i++) {
            JSONObject card = cards.optJSONObject(i); if (card == null) continue;
            String rel = card.optString("file", "");
            if (rel.isEmpty() || rel.contains("..") || !new File(unpack, rel).isFile()) throw new IllegalStateException("manifest references missing artwork");
        }

        File destination = new File(cardArtRoot(), requestedSetKey);
        File backup = new File(cardArtRoot(), requestedSetKey + ".old");
        deleteRecursive(backup);
        if (destination.exists() && !destination.renameTo(backup)) deleteRecursive(destination);
        if (!unpack.renameTo(destination)) {
            if (backup.exists()) backup.renameTo(destination);
            throw new IllegalStateException("could not activate set pack");
        }
        deleteRecursive(backup);
        deleteRecursive(tempRoot);
        return new JSONObject().put("ok", true).put("setKey", requestedSetKey).put("cards", cards.length()).put("files", files);
    }

    private void sendInstallResult(String token, JSONObject result) {
        final String js = "window.LuckyDexCardArt&&window.LuckyDexCardArt._nativeInstallComplete(" + JSONObject.quote(token == null ? "" : token) + "," + JSONObject.quote(result.toString()) + ");";
        runOnUiThread(() -> { if (webView != null) webView.evaluateJavascript(js, null); });
    }

    public class AndroidBridge {
        @JavascriptInterface public void setOrientation(String mode) {
            runOnUiThread(() -> setRequestedOrientation(
                "landscape".equalsIgnoreCase(mode)
                    ? ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                    : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            ));
        }

        @JavascriptInterface public void setImmersive(boolean enabled) {
            runOnUiThread(() -> {
                int flags = enabled
                    ? (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE)
                    : View.SYSTEM_UI_FLAG_VISIBLE;
                getWindow().getDecorView().setSystemUiVisibility(flags);
            });
        }

        @JavascriptInterface public void shareText(String text) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(i, "Export Lucky Dex save"));
            });
        }

        @JavascriptInterface public void packHaptic(String jsonPattern) {
            try {
                JSONArray values = new JSONArray(jsonPattern == null ? "[]" : jsonPattern);
                if (values.length() == 0) return;
                long[] waveform = new long[values.length() + 1];
                waveform[0] = 0;
                for (int i = 0; i < values.length(); i++) waveform[i + 1] = Math.max(0L, values.optLong(i, 0L));
                Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator == null || !vibrator.hasVibrator()) return;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) vibrator.vibrate(VibrationEffect.createWaveform(waveform, -1));
                else vibrator.vibrate(waveform, -1);
            } catch (Exception ignored) {
                // Haptics are enhancement-only; never interrupt a pack reveal.
            }
        }

        @JavascriptInterface public boolean hasCardArtSet(String setKey) {
            if (!safeKey(setKey)) return false;
            return new File(new File(cardArtRoot(), setKey), "manifest.json").isFile();
        }

        @JavascriptInterface public String getCardArtSetManifest(String setKey) {
            try {
                if (!safeKey(setKey)) return "";
                File file = new File(new File(cardArtRoot(), setKey), "manifest.json");
                return file.isFile() ? readUtf8(file) : "";
            } catch (Exception ignored) { return ""; }
        }

        @JavascriptInterface public String lookupCardArt(String setKey, String canonicalId, String number, String name) {
            try {
                if (!safeKey(setKey)) return "";
                File setDir = new File(cardArtRoot(), setKey);
                File manifestFile = new File(setDir, "manifest.json");
                if (!manifestFile.isFile()) return "";
                JSONObject manifest = new JSONObject(readUtf8(manifestFile));
                JSONArray cards = manifest.optJSONArray("cards"); if (cards == null) return "";
                String wantedId = canonicalId == null ? "" : canonicalId.trim();
                String wantedNumber = normalizeNumber(number);
                String wantedName = normalizeName(name);
                JSONObject hit = null;
                for (int i = 0; i < cards.length(); i++) {
                    JSONObject row = cards.optJSONObject(i); if (row == null) continue;
                    boolean idMatch = !wantedId.isEmpty() && wantedId.equals(row.optString("id", ""));
                    boolean nameMatch = wantedName.isEmpty() || wantedName.equals(normalizeName(row.optString("name", "")));
                    boolean numberMatch = !wantedNumber.isEmpty() && wantedNumber.equals(normalizeNumber(row.optString("number", row.optString("printed_number", ""))));
                    if ((idMatch && nameMatch) || (!wantedNumber.isEmpty() && !wantedName.isEmpty() && numberMatch && nameMatch)) {
                        if (hit != null) return ""; // Ambiguous is treated as missing, never guessed.
                        hit = row;
                    }
                }
                if (hit == null) return "";
                String rel = hit.optString("file", ""); if (rel.isEmpty() || rel.contains("..") || !new File(setDir, rel).isFile()) return "";
                StringBuilder url = new StringBuilder("https://").append(CARD_ART_HOST).append(CARD_ART_PREFIX).append(Uri.encode(setKey));
                for (String part : rel.split("/")) url.append('/').append(Uri.encode(part));
                return url.toString();
            } catch (Exception ignored) { return ""; }
        }

        @JavascriptInterface public void installCardArtPack(String setKey, String assetUrl, String expectedSha256, String token) {
            ioExecutor.execute(() -> {
                JSONObject result;
                File temp = null;
                try {
                    if (!safeKey(setKey)) throw new IllegalArgumentException("invalid set key");
                    Uri parsed = Uri.parse(assetUrl == null ? "" : assetUrl);
                    if (!"https".equalsIgnoreCase(parsed.getScheme())) throw new IllegalArgumentException("card-art URL must be HTTPS");
                    temp = File.createTempFile("luckydex-card-art-", ".zip", getCacheDir());
                    HttpURLConnection connection = (HttpURLConnection) new URL(assetUrl).openConnection();
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(45000);
                    connection.setInstanceFollowRedirects(true);
                    connection.setRequestProperty("User-Agent", "LuckyDex/0.16.7");
                    int status = connection.getResponseCode();
                    if (status < 200 || status >= 300) throw new IllegalStateException("card-art download HTTP " + status);
                    long announced = connection.getContentLengthLong();
                    if (announced > MAX_CARD_ART_ZIP_BYTES) throw new IllegalStateException("card-art pack is too large");
                    long received = 0L;
                    try (InputStream in = new BufferedInputStream(connection.getInputStream()); BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(temp))) {
                        byte[] buf = new byte[16384]; int n;
                        while ((n = in.read(buf)) >= 0) {
                            received += n;
                            if (received > MAX_CARD_ART_ZIP_BYTES) throw new IllegalStateException("card-art pack is too large");
                            out.write(buf, 0, n);
                        }
                    } finally { connection.disconnect(); }
                    if (received == 0) throw new IllegalStateException("empty card-art download");
                    String expected = expectedSha256 == null ? "" : expectedSha256.trim().toLowerCase(Locale.ROOT);
                    if (!expected.isEmpty()) {
                        String actual = sha256(temp);
                        if (!expected.equals(actual)) throw new IllegalStateException("card-art pack checksum mismatch");
                    }
                    result = installCardArtZip(setKey, temp);
                } catch (Exception error) {
                    try { result = new JSONObject().put("ok", false).put("setKey", setKey == null ? "" : setKey).put("error", String.valueOf(error.getMessage())); }
                    catch (Exception ignored) { result = new JSONObject(); }
                } finally { if (temp != null) temp.delete(); }
                sendInstallResult(token, result);
            });
        }

        @JavascriptInterface public boolean removeCardArtSet(String setKey) {
            if (!safeKey(setKey)) return false;
            File dir = new File(cardArtRoot(), setKey); boolean existed = dir.exists(); deleteRecursive(dir); return existed && !dir.exists();
        }
    }

    @Override public void onBackPressed() {
        if (webView == null) { finish(); return; }
        webView.evaluateJavascript("(function(){return window.handleLuckyBack ? window.handleLuckyBack() : false;})()", value -> {
            if ("true".equals(value)) return;
            if (webView.canGoBack()) webView.goBack(); else finish();
        });
    }

    @Override protected void onDestroy() {
        ioExecutor.shutdownNow();
        if (webView != null) { webView.removeJavascriptInterface("Android"); webView.destroy(); webView = null; }
        super.onDestroy();
    }

    @Override protected void onPause() {
        if (webView != null) {
            webView.evaluateJavascript("window.LuckyDexArcadeWorld&&window.LuckyDexArcadeWorld.suspend();window.LuckyDexAdventure&&window.LuckyDexAdventure.suspend()", null);
            webView.onPause();
        }
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.evaluateJavascript("window.LuckyDexAdventure&&window.LuckyDexAdventure.resume()", null);
        }
    }
}
