using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using BrickHigh.Infrastructure;
using BrickHigh.UnityRuntime;
using BrickHigh.PreviewEntry;
using UnityEditor;
using UnityEditor.AddressableAssets;
using UnityEditor.AddressableAssets.Settings;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace BrickHigh.Editor
{
    /// <summary>以真實來源 GLB 建立內部 Win64 探針，不能發布或標為 Ready。</summary>
    public static class ToolchainProbeBuild
    {
        /// <summary>命令列建置入口；獨立輸出且保留原專案的應用身分與渲染設定。</summary>
        public static void Build() => Build(false);

        /// <summary>建立可操作的內部 F-Catalog 幾何驗證包；不滿足 Ready 或可發行 Preview 門檻。</summary>
        public static void BuildInteractiveFixture() => Build(true);

        private static void Build(bool interactive)
        {
            if (!UnityEngine.Application.isBatchMode) throw new InvalidOperationException("僅允許獨立 batchmode 執行。");
            string project = Path.GetFullPath("..");
            string source = Path.Combine(project, "artifacts/models/3001-red-exploratory-v1/model.glb");
            if (SafeContent.Hash(File.ReadAllBytes(source)) != "a4c11b4d5c56235d8f29d60f83949a0360ae92a17e2161c7998184246216bae9")
                throw new InvalidDataException("來源不是已記錄的幾何探針。");
            var modelFolders = interactive ? new[] { "3001-red-exploratory-v1", "pm-20260923-plate-3020", "pm-20260923-transparent-color47",
                "pm-20260923-printed-torso-973p06-color4", "pm-20260923-technic-pin-2780", "pm-20260923-technic-axle-3705", "pm-20260923-duplo-3437",
                "pm-20260923-asymmetric-slope-3298-materials-v2" }
                : new[] { "3001-red-exploratory-v1" };
            var modelSources = modelFolders.Select(folder => Path.Combine(project, "artifacts/models", folder)).ToArray();
            string id = DateTime.UtcNow.ToString("yyyyMMddTHHmmss") + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);
            string generated = "Assets/ToolchainProbeGenerated/" + id;
            string output = Path.Combine(project, "artifacts/acceptance/toolchain-" + id);
            Directory.CreateDirectory(generated);
            Directory.CreateDirectory(output);
            var platform = NamedBuildTarget.Standalone;
            string company = PlayerSettings.companyName, product = PlayerSettings.productName;
            string applicationId = PlayerSettings.GetApplicationIdentifier(platform);
            var serializedPlayer = new SerializedObject(Resources.FindObjectsOfTypeAll<PlayerSettings>().Single());
            bool overrideIdentifier = serializedPlayer.FindProperty("overrideDefaultApplicationIdentifier").boolValue;
            var backend = PlayerSettings.GetScriptingBackend(platform);
            var colorSpace = PlayerSettings.colorSpace;
            var pipeline = GraphicsSettings.defaultRenderPipeline;
            var qualityPipeline = QualitySettings.renderPipeline;
            var defaultSettings = AddressableAssetSettingsDefaultObject.Settings;
            string streaming = "Assets/StreamingAssets/ToolchainProbe";
            bool createdDatabase = false;
            bool createdCatalog = false;
            string packDirectory = null;
            var api = PlayerSettings.GetGraphicsAPIs(BuildTarget.StandaloneWindows64);
            bool automaticApi = PlayerSettings.GetUseDefaultGraphicsAPIs(BuildTarget.StandaloneWindows64);
            try
            {
                PlayerSettings.companyName = "GameNenStyle";
                PlayerSettings.productName = interactive ? "BrickHighPreview" : "BrickHighToolchainProbe";
                PlayerSettings.SetApplicationIdentifier(platform, interactive ? "com.gamenenstyle.brickhigh.preview" : "com.gamenenstyle.brickhigh.toolchainprobe");
                PlayerSettings.SetScriptingBackend(platform, ScriptingImplementation.Mono2x);
                if (interactive) PlayerSettings.colorSpace = ColorSpace.Linear;
                PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.StandaloneWindows64, false);
                PlayerSettings.SetGraphicsAPIs(BuildTarget.StandaloneWindows64, new[] { GraphicsDeviceType.Direct3D11 });
                var renderer = ScriptableObject.CreateInstance<UniversalRendererData>();
                AssetDatabase.CreateAsset(renderer, generated + "/renderer.asset");
                var urp = UniversalRenderPipelineAsset.Create(renderer);
                AssetDatabase.CreateAsset(urp, generated + "/pipeline.asset");
                GraphicsSettings.defaultRenderPipeline = urp;
                QualitySettings.renderPipeline = urp;
                AssetDatabase.SaveAssets();
                for (int i = 0; i < modelSources.Length; i++)
                {
                    string modelSource = Path.Combine(modelSources[i], "model.glb");
                    var conversion = JObject.Parse(File.ReadAllText(Path.Combine(modelSources[i], "conversion.json")));
                    if (SafeContent.Hash(File.ReadAllBytes(modelSource)) != (string)conversion["geometry"]["sha256"])
                        throw new InvalidDataException("模型與來源證據不一致。");
                    string glb = generated + "/source-" + i + ".glb";
                    File.Copy(modelSource, glb, false);
                    AssetDatabase.ImportAsset(glb, ImportAssetOptions.ForceSynchronousImport);
                    var imported = AssetDatabase.LoadAssetAtPath<GameObject>(glb);
                    if (imported == null) throw new InvalidDataException("GLB 匯入未產生 Prefab。");
                    var wrapper = new GameObject("Internal geometry probe - not Ready");
                    var child = UnityEngine.Object.Instantiate(imported, wrapper.transform);
                    // glTFast 翻 X；純 Y 軸旋轉使結果符合本專案翻 Z 契約，不再鏡像或重翻三角形。
                    child.transform.localRotation = Quaternion.Euler(0, 180, 0) * child.transform.localRotation;
                    PrefabUtility.SaveAsPrefabAsset(wrapper, generated + "/model-" + i + ".prefab");
                    UnityEngine.Object.DestroyImmediate(wrapper);
                }
                Directory.CreateDirectory(AddressableAssetSettingsDefaultObject.kDefaultConfigFolder);
                var settings = AddressableAssetSettings.Create(generated + "/Addressables", "ProbeSettings", true, true);
                AddressableAssetSettingsDefaultObject.Settings = settings;
                settings.BuildRemoteCatalog = false;
                settings.DisableCatalogUpdateOnStartup = true;
                settings.BuildAddressablesWithPlayerBuild = AddressableAssetSettings.PlayerBuildOption.DoNotBuildWithPlayer;
                for (int i = 0; i < modelSources.Length; i++)
                    settings.CreateOrMoveEntry(AssetDatabase.AssetPathToGUID(generated + "/model-" + i + ".prefab"), settings.DefaultGroup).address = i == 0 ? "probe/model" : "probe/model-" + i;
                AssetDatabase.SaveAssets();
                AddressableAssetSettings.BuildPlayerContent(out var content);
                if (!string.IsNullOrEmpty(content.Error)) throw new InvalidDataException(content.Error);
                var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                var camera = new GameObject("Probe Camera", typeof(Camera));
                camera.tag = "MainCamera";
                camera.GetComponent<Camera>().nearClipPlane = 0.001f;
                camera.GetComponent<Camera>().farClipPlane = 10;
                camera.GetComponent<Camera>().clearFlags = CameraClearFlags.SolidColor;
                camera.GetComponent<Camera>().backgroundColor = new Color(0.08f, 0.1f, 0.14f);
                var light = new GameObject("Soft key", typeof(Light));
                light.GetComponent<Light>().type = LightType.Directional;
                light.GetComponent<Light>().intensity = interactive ? 1.0f : 1.5f;
                light.transform.rotation = Quaternion.Euler(45, -35, 0);
                RenderSettings.ambientMode = AmbientMode.Flat;
                RenderSettings.ambientLight = new Color(0.45f, 0.45f, 0.45f);
                var probe = new GameObject("Internal verification", typeof(ToolchainProbe)).GetComponent<ToolchainProbe>();
                if (File.Exists(streaming + "/probe.db")) throw new IOException("既有探針資料不得覆蓋。");
                Directory.CreateDirectory(streaming);
                createdDatabase = true;
                using (var db = new NativeSqlite(streaming + "/probe.db", false))
                { db.Execute("CREATE TABLE probe(value TEXT NOT NULL)"); db.Execute("INSERT INTO probe VALUES(?)", "繁體中文'100%_積木"); }
                probe.PackId = "p" + Guid.NewGuid().ToString("N").Substring(0, 8);
                packDirectory = "Assets/StreamingAssets/Catalog/" + probe.PackId;
                if (Directory.Exists(packDirectory)) throw new IOException("不可覆蓋既有發行資料。");
                Directory.CreateDirectory(packDirectory);
                createdCatalog = true;
                CreateReadFixture(project, packDirectory, probe, modelSources);
                if (interactive)
                {
                    var entry = new GameObject("Offline Preview entry", typeof(PreviewBootstrap)).GetComponent<PreviewBootstrap>();
                    entry.BundledFont = AssetDatabase.LoadAssetAtPath<Font>("Assets/BrickHigh/Fonts/NotoSansCJKtc-Regular.otf");
                    entry.FontLicense = AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/BrickHigh/Fonts/NotoSansCJK-LICENSE.bytes");
                    entry.ModelCamera = camera.GetComponent<Camera>();
                    entry.PackId = probe.PackId; entry.BuildId = id; entry.PackagedVariantCount = modelSources.Length;
                    UnityEngine.Object.DestroyImmediate(probe.gameObject);
                }
                EditorSceneManager.SaveScene(scene, generated + "/probe.unity");
                AssetDatabase.Refresh();
                var build = BuildPipeline.BuildPlayer(new BuildPlayerOptions { scenes = new[] { generated + "/probe.unity" },
                    locationPathName = Path.Combine(output, interactive ? "Package/Player/BrickHighPreview.exe" : "Player/BrickHighToolchainProbe.exe"), target = BuildTarget.StandaloneWindows64,
                    options = BuildOptions.None, extraScriptingDefines = new[] { interactive ? "BRICKHIGH_INTERNAL_UI" : "BRICKHIGH_TOOLCHAIN_PROBE" } });
                if (build.summary.result != BuildResult.Succeeded) throw new InvalidOperationException("Player 建置失敗。");
                File.Copy("Packages/packages-lock.json", Path.Combine(output, "packages-lock.json"));
                if (interactive) CreateInstallPackage(project, output, id);
                Debug.Log("BRICKHIGH_PROBE_BUILD " + output);
            }
            finally
            {
                // 成功或失敗都移回本次 fixture；不刪除或覆蓋使用者資料。
                if (createdDatabase && File.Exists(streaming + "/probe.db"))
                    File.Move(streaming + "/probe.db", generated + "/probe.db");
                if (createdCatalog)
                {
                    string sourcePack = Path.GetFullPath(packDirectory);
                    string allowed = Path.GetFullPath("Assets/StreamingAssets/Catalog") + Path.DirectorySeparatorChar;
                    string destinationPack = Path.GetFullPath(generated + "/catalog-fixture");
                    string generatedPrefix = Path.GetFullPath("Assets/ToolchainProbeGenerated") + Path.DirectorySeparatorChar;
                    if (!sourcePack.StartsWith(allowed, StringComparison.OrdinalIgnoreCase)
                        || !destinationPack.StartsWith(generatedPrefix, StringComparison.OrdinalIgnoreCase))
                        throw new InvalidDataException("人工包移回路徑越界。");
                    string moveError = AssetDatabase.MoveAsset(packDirectory, generated + "/catalog-fixture");
                    if (!string.IsNullOrEmpty(moveError)) throw new IOException(moveError);
                }
                PlayerSettings.companyName = company;
                PlayerSettings.productName = product;
                PlayerSettings.SetApplicationIdentifier(platform, applicationId);
                serializedPlayer.Update();
                serializedPlayer.FindProperty("overrideDefaultApplicationIdentifier").boolValue = overrideIdentifier;
                serializedPlayer.ApplyModifiedPropertiesWithoutUndo();
                PlayerSettings.SetScriptingBackend(platform, backend);
                PlayerSettings.colorSpace = colorSpace;
                PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.StandaloneWindows64, automaticApi);
                PlayerSettings.SetGraphicsAPIs(BuildTarget.StandaloneWindows64, api);
                GraphicsSettings.defaultRenderPipeline = pipeline;
                QualitySettings.renderPipeline = qualityPipeline;
                AddressableAssetSettingsDefaultObject.Settings = defaultSettings;
                if (defaultSettings == null) EditorBuildSettings.RemoveConfigObject(AddressableAssetSettingsDefaultObject.kDefaultConfigObjectName);
                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();
                serializedPlayer.Dispose();
            }
        }

        // 人工 F-Catalog 僅驗證 adapter；刻意保留 Unknown／非 Ready，不進入發布流程。
        private static void CreateReadFixture(string project, string packDirectory, ToolchainProbe probe, string[] modelSources)
        {
            probe.SnapshotId = Guid.NewGuid().ToString();
            probe.VariantId = Guid.NewGuid().ToString();
            probe.RevisionId = Guid.NewGuid().ToString();
            var files = new JArray();
            string buildPath = UnityEngine.AddressableAssets.Addressables.BuildPath;
            foreach (var file in Directory.GetFiles(buildPath, "*", SearchOption.AllDirectories))
            {
                string extension = Path.GetExtension(file);
                if (!new[] { ".bundle", ".bin", ".hash", ".json" }.Contains(extension)) continue;
                string key = "aa/" + Path.GetRelativePath(buildPath, file).Replace('\\', '/');
                string destination = SafeContent.Resolve(packDirectory, key);
                Directory.CreateDirectory(Path.GetDirectoryName(destination));
                File.Copy(file, destination, false);
                files.Add(new JObject { ["storageKey"] = key, ["sha256"] = SafeContent.Hash(File.ReadAllBytes(file)),
                    ["byteLength"] = new FileInfo(file).Length, ["kind"] = extension == ".bundle" ? "AssetBundle" : extension == ".bin" ? "LocalCatalog" : "Metadata" });
            }
            var bundle = files.Single(x => (string)x["kind"] == "AssetBundle");
            LocalAddressablesPolicy.Validate(File.ReadAllText(Path.Combine(buildPath, "settings.json")),
                files.Where(x => (string)x["kind"] == "LocalCatalog").Select(x => (string)x["storageKey"]));
            string lockDigest = SafeContent.Hash(File.ReadAllBytes("Packages/packages-lock.json"));
            string buildId = Guid.NewGuid().ToString();
            var manifest = new JObject {
                ["purpose"] = "F-Catalog", ["readyAsset"] = false, ["packId"] = probe.PackId,
                ["appVersion"] = "0.0.0-probe", ["editorVersion"] = UnityEngine.Application.unityVersion, ["readerVersion"] = 1,
                ["currentSnapshotId"] = probe.SnapshotId, ["catalogSchemaVersion"] = 1, ["assetContractVersion"] = 1,
                ["applicationId"] = "com.gamenenstyle.brickhigh.preview", ["packageKind"] = "Preview", ["buildTarget"] = "windows-x64",
                ["sourceSnapshotStatus"] = "Frozen", ["sourceSelectionDigest"] = new string('a', 64), ["packageLockDigest"] = lockDigest,
                ["compatibleSaveVersions"] = new JArray(1), ["previewCompleteness"] = new JObject { ["incomplete"] = true }, ["files"] = files
            };
            using (var db = new NativeSqlite(Path.Combine(packDirectory, "catalog.db"), false))
            {
                foreach (var sql in File.ReadAllText(Path.Combine(project, "tools/catalog/runtime_schema.sql")).Split(';'))
                    if (!string.IsNullOrWhiteSpace(sql)) db.Execute(sql);
                foreach (var key in new[] { "packId", "currentSnapshotId", "applicationId", "packageKind", "buildTarget", "sourceSnapshotStatus", "assetContractVersion" })
                    db.Execute("INSERT INTO runtime_meta VALUES(?,?)", key, (string)manifest[key]);
                db.Execute("INSERT INTO runtime_meta VALUES('schemaVersion','1')");
                db.Execute("INSERT INTO runtime_meta VALUES('minReaderVersion','1')");
                db.Execute("INSERT INTO runtime_snapshots VALUES(?,?,?,1)", probe.SnapshotId, "2026-09-08T15:59:59Z",
                    new JObject { ["C"] = modelSources.Length, ["A"] = 0, ["R"] = 0, ["U"] = modelSources.Length, ["G"] = modelSources.Length, ["V"] = 0, ["scope_reviewed"] = false }.ToString());
                for (int i = 0; i < modelSources.Length; i++)
                {
                string variant = i == 0 ? probe.VariantId : Guid.NewGuid().ToString();
                string revision = i == 0 ? probe.RevisionId : Guid.NewGuid().ToString();
                string runtime = i == 0 ? buildId : Guid.NewGuid().ToString();
                var conversion = JObject.Parse(File.ReadAllText(Path.Combine(modelSources[i], "conversion.json")));
                string part = (string)conversion["source"]["filename"];
                var min = conversion["geometry"]["boundsMeters"]["min"];
                var max = conversion["geometry"]["boundsMeters"]["max"];
                var metadata = new JObject { ["readyAsset"] = false, ["widthMeters"] = (double)max[0] - (double)min[0],
                    ["heightMeters"] = (double)max[1] - (double)min[1], ["depthMeters"] = (double)max[2] - (double)min[2] };
                db.Execute("INSERT INTO runtime_revisions VALUES(?,?)", variant, revision);
                db.Execute("INSERT INTO runtime_variants VALUES(?,?,?,?,?,?,?,?)", probe.SnapshotId, variant, Guid.NewGuid().ToString(),
                    "Unknown", "Basic", new JObject { ["name"] = "內部幾何 " + part + (modelSources[i].Contains("transparent") ? " 透明" : ""),
                        ["family"] = part == "3437.dat" ? "DUPLO" : part == "2780.dat" || part == "3705.dat" ? "Technic" : "System",
                        ["partNumber"] = Path.GetFileNameWithoutExtension(part) }.ToString(), "{}", revision);
                db.Execute("INSERT INTO runtime_builds VALUES(?,?,?,?,?,?,?,?,?,?)", runtime, variant, revision, "windows-x64",
                    UnityEngine.Application.unityVersion, lockDigest, "canonical-rh-to-unity-lh-v1", (string)bundle["sha256"], "internal-probe-not-quality-approved", (string)bundle["storageKey"]);
                db.Execute("INSERT INTO runtime_models VALUES(?,?,?,?,?,?,?)", probe.SnapshotId, variant, revision, "windows-x64", runtime,
                    metadata.ToString(), i == 0 ? "probe/model" : "probe/model-" + i);
                Directory.CreateDirectory(Path.Combine(packDirectory, "SourceEvidence"));
                string evidenceKey = "SourceEvidence/" + i + ".json";
                string evidence = Path.Combine(packDirectory, evidenceKey);
                File.WriteAllText(evidence, conversion.ToString());
                files.Add(new JObject { ["storageKey"] = evidenceKey, ["sha256"] = SafeContent.Hash(File.ReadAllBytes(evidence)),
                    ["byteLength"] = new FileInfo(evidence).Length, ["kind"] = "Metadata" });
                }
                foreach (var file in files)
                    db.Execute("INSERT INTO runtime_files VALUES(?,?,?,?)", (string)file["storageKey"], (string)file["sha256"], (long)file["byteLength"], (string)file["kind"]);
            }
            manifest["catalogDbSha256"] = SafeContent.Hash(File.ReadAllBytes(Path.Combine(packDirectory, "catalog.db")));
            using (var writer = new StreamWriter(new FileStream(Path.Combine(packDirectory, "release-manifest.json"), FileMode.CreateNew))) writer.Write(manifest.ToString());
        }

        private static void CreateInstallPackage(string project, string output, string id)
        {
            string package = Path.Combine(output, "Package");
            string symbols = Path.GetFullPath(Path.Combine(package, "Player/BrickHighPreview_BurstDebugInformation_DoNotShip"));
            string keptSymbols = Path.GetFullPath(Path.Combine(output, "BuildSymbols"));
            string outputPrefix = Path.GetFullPath(output) + Path.DirectorySeparatorChar;
            if (!symbols.StartsWith(outputPrefix, StringComparison.OrdinalIgnoreCase)
                || !keptSymbols.StartsWith(outputPrefix, StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("符號檔路徑越界。");
            if (Directory.Exists(symbols)) Directory.Move(symbols, keptSymbols);
            File.Copy(Path.Combine(project, "artifacts/toolchain/launcher-pm-20260923/BrickHighLauncher.exe"), Path.Combine(package, "BrickHighLauncher.exe"));
            Directory.CreateDirectory(Path.Combine(package, "Installer"));
            File.Copy(Path.Combine(project, "artifacts/toolchain/installer-pm-20260924-final/BrickHighInstaller.exe"), Path.Combine(package, "Installer/BrickHighInstaller.exe"));
            File.Copy(Path.Combine(package, "Installer/BrickHighInstaller.exe"), Path.Combine(output, "BrickHighInstaller.exe"));
            File.Copy("Assets/BrickHigh/Fonts/NotoSansCJK-LICENSE.bytes", Path.Combine(package, "NotoSansCJK-LICENSE.txt"));
            foreach (string license in new[] { "CAlicense.txt", "CAlicense4.txt", "CAreadme.txt" })
                File.Copy(Path.Combine(project, "artifacts/sources/ldraw-release/ldraw", license), Path.Combine(package, "LDraw-" + license));
            var files = new JArray(Directory.GetFiles(package, "*", SearchOption.AllDirectories).Select(path => new JObject {
                ["key"] = Path.GetRelativePath(package, path).Replace('\\', '/'), ["sha256"] = SafeContent.Hash(File.ReadAllBytes(path)), ["byteLength"] = new FileInfo(path).Length }));
            var index = new JObject { ["applicationId"] = "com.gamenenstyle.brickhigh.preview", ["packageKind"] = "Preview", ["buildId"] = id,
                ["purpose"] = "F-Catalog", ["description"] = "Internal geometry - not Ready", ["playerKey"] = "Player/BrickHighPreview.exe", ["files"] = files };
            File.WriteAllText(Path.Combine(package, "package-index.json"), index.ToString());
        }
    }
}
