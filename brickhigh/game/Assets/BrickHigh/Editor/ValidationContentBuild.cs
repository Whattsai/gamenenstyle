using System;
using System.IO;
using System.Linq;
using BrickHigh.Infrastructure;
using BrickHigh.UnityRuntime;
using Newtonsoft.Json.Linq;
using UnityEditor;
using UnityEditor.AddressableAssets;
using UnityEditor.AddressableAssets.Settings;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Process = System.Diagnostics.Process;
using ProcessStartInfo = System.Diagnostics.ProcessStartInfo;

namespace BrickHigh.Editor
{
    /// <summary>SPEC §13.2正式Frozen建置器；不合成快照、不核准品質、不切Published head。</summary>
    public static class ValidationContentBuild
    {
        /// <summary>固定build-plans/validation-content.json輸入；空缺時釘選既有QA Frozen並回報品質阻擋。</summary>
        public static void BuildValidationContent()
        {
            if (!UnityEngine.Application.isBatchMode || EditorUserBuildSettings.activeBuildTarget != BuildTarget.StandaloneWindows64)
                throw new InvalidOperationException("Frozen validation僅允許Windows64 batchmode。");
            string project = Path.GetFullPath("..");
            string id = DateTime.UtcNow.ToString("yyyyMMddTHHmmss") + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);
            string key = "artifacts/validation-content/" + id;
            string output = SafeContent.Resolve(project, key);
            Debug.Log("BRICKHIGH_VALIDATION_OUTPUT " + output);
            RunPython(project, "prepare", key, UnityEngine.Application.unityVersion);
            var inputs = JObject.Parse(File.ReadAllText(Path.Combine(output, "inputs.json")));
            BuildPreparedContent(project, id, key, inputs);
        }

        /// <summary>共用真bundle／Player實作；測試模式只能輸出隔離的testOnly證據，不提交正式驗證。</summary>
        public static void BuildPreparedContent(string project, string id, string key, JObject inputs, bool contractTest = false)
        {
            if (contractTest && (inputs["testOnly"]?.Value<bool>() != true
                || !key.StartsWith("artifacts/acceptance/validation-content-engine-test/", StringComparison.Ordinal)))
                throw new InvalidDataException("ContractTestMustBeIsolated");
            if (!contractTest && (!key.StartsWith("artifacts/validation-content/", StringComparison.Ordinal)
                || (string)inputs["purpose"] != "FrozenValidationContent")) throw new InvalidDataException("FormalValidationInputRequired");
            string output = SafeContent.Resolve(project, key);
            var request = (JObject)inputs["request"];
            if ((string)request["editorVersion"] != UnityEngine.Application.unityVersion
                || (string)request["packageLockDigest"] != SafeContent.Hash(File.ReadAllBytes("Packages/packages-lock.json")))
                throw new InvalidDataException("實際Unity工具鏈與Frozen建置輸入不一致。");

            string generated = "Assets/ToolchainProbeGenerated/validation-" + id;
            string settingsFile = "Assets/AddressableAssetsData/DefaultObject.asset";
            byte[] playerSettingsBytes = File.ReadAllBytes("ProjectSettings/ProjectSettings.asset");
            byte[] defaultSettingsBytes = File.Exists(settingsFile) ? File.ReadAllBytes(settingsFile) : null;
            var priorSettings = AddressableAssetSettingsDefaultObject.Settings;
            var platform = NamedBuildTarget.Standalone;
            string company = PlayerSettings.companyName, product = PlayerSettings.productName;
            string appId = PlayerSettings.GetApplicationIdentifier(platform);
            var backend = PlayerSettings.GetScriptingBackend(platform);
            var colorSpace = PlayerSettings.colorSpace;
            var graphics = GraphicsSettings.defaultRenderPipeline; var quality = QualitySettings.renderPipeline;
            try
            {
                Directory.CreateDirectory(generated);
                PlayerSettings.companyName = "GameNenStyle"; PlayerSettings.productName = "BrickHighValidation";
                PlayerSettings.SetApplicationIdentifier(platform, "com.gamenenstyle.brickhigh.validation");
                PlayerSettings.SetScriptingBackend(platform, ScriptingImplementation.Mono2x);
                PlayerSettings.colorSpace = ColorSpace.Linear;
                var renderer = ScriptableObject.CreateInstance<UniversalRendererData>();
                AssetDatabase.CreateAsset(renderer, generated + "/renderer.asset");
                var pipeline = UniversalRenderPipelineAsset.Create(renderer);
                AssetDatabase.CreateAsset(pipeline, generated + "/pipeline.asset");
                GraphicsSettings.defaultRenderPipeline = pipeline; QualitySettings.renderPipeline = pipeline;

                var settings = AddressableAssetSettings.Create(generated + "/Addressables", "ValidationSettings", true, true);
                AddressableAssetSettingsDefaultObject.Settings = settings;
                settings.BuildRemoteCatalog = false; settings.DisableCatalogUpdateOnStartup = true;
                settings.BuildAddressablesWithPlayerBuild = AddressableAssetSettings.PlayerBuildOption.DoNotBuildWithPlayer;
                settings.profileSettings.SetValue(settings.activeProfileId, AddressableAssetSettings.kLocalBuildPath,
                    "[UnityEngine.AddressableAssets.Addressables.BuildPath]/validation-" + id);
                settings.profileSettings.SetValue(settings.activeProfileId, AddressableAssetSettings.kLocalLoadPath,
                    "{UnityEngine.AddressableAssets.Addressables.RuntimePath}/validation-" + id);
                var rows = new JArray();
                foreach (var model in (JArray)inputs["models"])
                {
                    string revision = (string)model["revisionId"];
                    string glb = generated + "/source-" + revision + ".glb";
                    byte[] bytes = File.ReadAllBytes(SafeContent.Resolve(output, (string)model["modelKey"]));
                    if (SafeContent.Hash(bytes) != (string)model["modelSha256"]) throw new InvalidDataException("FrozenSourceHashMismatch");
                    File.WriteAllBytes(glb, bytes); AssetDatabase.ImportAsset(glb, ImportAssetOptions.ForceSynchronousImport);
                    var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(glb);
                    if (prefab == null) throw new InvalidDataException("FrozenGlbImportFailed");
                    var wrapper = new GameObject("Frozen revision " + revision);
                    try
                    {
                        var child = UnityEngine.Object.Instantiate(prefab, wrapper.transform);
                        // 與既有真glTFast驗證相同：翻X後旋轉Y180度，符合canonical翻Z契約。
                        child.transform.localRotation = Quaternion.Euler(0, 180, 0) * child.transform.localRotation;
                        var dimensions = (JArray)model["metadata"]["referenceDimensions"];
                        ValidationContentPlayer.InspectModel(wrapper, dimensions);
                        string asset = generated + "/model-" + revision + ".prefab";
                        PrefabUtility.SaveAsPrefabAsset(wrapper, asset);
                        settings.CreateOrMoveEntry(AssetDatabase.AssetPathToGUID(asset), settings.DefaultGroup).address = "revision/" + revision;
                        rows.Add(new JObject { ["revisionId"] = revision, ["assetName"] = asset.ToLowerInvariant(),
                            ["modelSha256"] = model["modelSha256"], ["referenceDimensions"] = dimensions.DeepClone(), ["passed"] = true });
                    }
                    finally { UnityEngine.Object.DestroyImmediate(wrapper); }
                }
                AssetDatabase.SaveAssets();
                AddressableAssetSettings.BuildPlayerContent(out var content);
                if (!string.IsNullOrEmpty(content.Error)) throw new InvalidDataException(content.Error);
                string initialization = UnityEngine.AddressableAssets.Addressables.BuildPath;
                Directory.CreateDirectory(Path.Combine(output, "content"));
                string settingsPath = Path.Combine(initialization, "settings.json");
                var initializationData = JObject.Parse(File.ReadAllText(settingsPath));
                const string runtimePrefix = "{UnityEngine.AddressableAssets.Addressables.RuntimePath}/";
                string catalogId = (string)initializationData["m_CatalogLocations"][0]["m_InternalId"];
                if (!catalogId.StartsWith(runtimePrefix, StringComparison.Ordinal)) throw new InvalidDataException("NonLocalValidationCatalog");
                string catalogKey = catalogId.Substring(runtimePrefix.Length);
                LocalAddressablesPolicy.Validate(File.ReadAllText(settingsPath), new[] { "aa/" + catalogKey });
                foreach (string fileKey in new[] { "settings.json", catalogKey })
                {
                    string destination = SafeContent.Resolve(output, "content/" + fileKey);
                    Directory.CreateDirectory(Path.GetDirectoryName(destination));
                    File.Copy(SafeContent.Resolve(Path.GetFullPath(initialization), fileKey), destination, false);
                }
                foreach (string file in Directory.GetFiles(Path.Combine(initialization, "validation-" + id), "*.bundle", SearchOption.AllDirectories))
                {
                    string destination = SafeContent.Resolve(output, "content/" + Path.GetRelativePath(initialization, file).Replace('\\', '/'));
                    Directory.CreateDirectory(Path.GetDirectoryName(destination));
                    File.Copy(file, destination, false);
                }
                var bundles = new JArray();
                foreach (string file in Directory.GetFiles(Path.Combine(output, "content"), "*.bundle", SearchOption.AllDirectories))
                {
                    string bundleKey = Path.GetRelativePath(output, file).Replace('\\', '/');
                    string sha = SafeContent.Hash(File.ReadAllBytes(file));
                    bundles.Add(new JObject { ["key"] = bundleKey, ["sha256"] = sha });
                    var bundle = AssetBundle.LoadFromFile(file);
                    if (bundle == null) throw new InvalidDataException("EditorBundleLoadFailed");
                    try
                    {
                        var names = bundle.GetAllAssetNames();
                        Debug.Log("BRICKHIGH_VALIDATION_BUNDLE " + bundleKey + " " + string.Join(",", names));
                        foreach (var row in rows.Where(r => names.Contains((string)r["assetName"], StringComparer.OrdinalIgnoreCase)))
                        {
                            if (row["bundleKey"] != null) throw new InvalidDataException("DuplicateRuntimePrefab");
                            row["bundleKey"] = bundleKey; row["bundleSha256"] = sha;
                            row["assetName"] = names.Single(n => string.Equals(n, (string)row["assetName"], StringComparison.OrdinalIgnoreCase));
                        }
                    }
                    finally { bundle.Unload(true); }
                }
                if (rows.Count == 0 || rows.Any(r => r["bundleKey"] == null)) throw new InvalidDataException("RuntimePrefabNotBundled");
                WriteNew(Path.Combine(output, "editor-report.json"), new JObject { ["passed"] = true,
                    ["editorVersion"] = UnityEngine.Application.unityVersion, ["requestDigest"] = inputs["requestDigest"], ["models"] = rows });
                WriteNew(Path.Combine(output, "player-plan.json"), new JObject { ["purpose"] = "FrozenValidationContent",
                    ["requestDigest"] = inputs["requestDigest"], ["models"] = rows.DeepClone(), ["bundles"] = bundles });

                var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                var camera = new GameObject("ValidationCamera", typeof(Camera)); camera.tag = "MainCamera";
                var light = new GameObject("ValidationLight", typeof(Light)).GetComponent<Light>();
                light.type = LightType.Directional; light.intensity = 1; light.transform.rotation = Quaternion.Euler(45, -35, 0);
                RenderSettings.ambientMode = AmbientMode.Flat; RenderSettings.ambientLight = new Color(.45f, .45f, .45f);
                new GameObject("FrozenContentValidation", typeof(ValidationContentPlayer));
                EditorSceneManager.SaveScene(scene, generated + "/validation.unity");
                var build = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
                    scenes = new[] { generated + "/validation.unity" }, locationPathName = Path.Combine(output, "Player/BrickHighValidation.exe"),
                    target = BuildTarget.StandaloneWindows64, options = BuildOptions.None,
                    extraScriptingDefines = new[] { "BRICKHIGH_VALIDATION_PLAYER" } });
                if (build.summary.result != BuildResult.Succeeded) throw new InvalidOperationException("FrozenValidationPlayerBuildFailed");
                var start = new ProcessStartInfo(Path.Combine(output, "Player/BrickHighValidation.exe"),
                    "-batchmode -force-d3d11 -validation-root " + Quote(output) + " -logFile " + Quote(Path.Combine(output, "player.log")))
                    { WorkingDirectory = project, UseShellExecute = false, CreateNoWindow = true };
                using (var process = Process.Start(start))
                {
                    if (process == null) throw new InvalidOperationException("PlayerSpawnFailed");
                    if (!process.WaitForExit(240000)) { process.Kill(); throw new TimeoutException("PlayerValidationTimeout"); }
                    WriteNew(Path.Combine(output, "execution.json"), new JObject { ["requestDigest"] = inputs["requestDigest"],
                        ["playerExitCode"] = process.ExitCode, ["purpose"] = "FrozenValidationPlayer" });
                    if (process.ExitCode != 0) throw new InvalidOperationException("PlayerValidationFailed: " + process.ExitCode);
                }
                if (contractTest)
                    WriteNew(Path.Combine(output, "contract-result.json"), new JObject { ["testOnly"] = true,
                        ["passed"] = true, ["sourceQualityApproved"] = false, ["isPreviewOrRelease"] = false });
                else RunPython(project, "finalize", key);
                Debug.Log("BRICKHIGH_VALIDATION_CONTENT_PASSED " + output);
            }
            finally
            {
                PlayerSettings.companyName = company; PlayerSettings.productName = product;
                PlayerSettings.SetApplicationIdentifier(platform, appId); PlayerSettings.SetScriptingBackend(platform, backend);
                PlayerSettings.colorSpace = colorSpace; GraphicsSettings.defaultRenderPipeline = graphics; QualitySettings.renderPipeline = quality;
                AddressableAssetSettingsDefaultObject.Settings = priorSettings;
                if (priorSettings == null) EditorBuildSettings.RemoveConfigObject(AddressableAssetSettingsDefaultObject.kDefaultConfigObjectName);
                AssetDatabase.SaveAssets();
                File.WriteAllBytes("ProjectSettings/ProjectSettings.asset", playerSettingsBytes);
                if (defaultSettingsBytes != null) File.WriteAllBytes(settingsFile, defaultSettingsBytes);
                AssetDatabase.Refresh();
            }
        }

        private static void WriteNew(string path, JObject value)
        {
            using (var stream = new StreamWriter(new FileStream(path, FileMode.CreateNew))) stream.Write(value.ToString());
        }
        private static string Quote(string value)
        {
            if (value.Contains('"') || value.Contains('\n') || value.Contains('\r')) throw new InvalidDataException("UnsafeBuildPath");
            return "\"" + value + "\"";
        }
        private static void RunPython(string project, string action, string output, string editor = null)
        {
            string args = "-m tools.catalog.validation_content " + action + " --project " + Quote(project) + " --output " + Quote(output);
            if (editor != null) args += " --editor-version " + Quote(editor);
            var start = new ProcessStartInfo("python.exe", args) { WorkingDirectory = project,
                UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
            start.EnvironmentVariables["PYTHONIOENCODING"] = "utf-8";
            using (var process = Process.Start(start))
            {
                if (process == null) throw new InvalidOperationException("FrozenPythonSpawnFailed");
                process.OutputDataReceived += (_, e) => { if (e.Data != null) Debug.Log(e.Data); };
                process.ErrorDataReceived += (_, e) => { if (e.Data != null) Debug.LogError(e.Data); };
                process.BeginOutputReadLine(); process.BeginErrorReadLine();
                if (!process.WaitForExit(120000)) { process.Kill(); throw new TimeoutException("FrozenPythonTimeout"); }
                process.WaitForExit();
                if (process.ExitCode == 3) throw new InvalidOperationException("FrozenSourceQualityBlocked: inspect immutable preflight.json; no Pending review was approved.");
                if (process.ExitCode != 0) throw new InvalidOperationException("FrozenPreflightOrEvidenceRejected: " + process.ExitCode);
            }
        }
    }
}
