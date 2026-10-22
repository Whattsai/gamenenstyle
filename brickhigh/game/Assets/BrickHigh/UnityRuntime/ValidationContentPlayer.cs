#if UNITY_EDITOR || BRICKHIGH_VALIDATION_PLAYER
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using BrickHigh.Infrastructure;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace BrickHigh.UnityRuntime
{
    /// <summary>只驗證真正Frozen建置的bundle，不開Profiles、不核准來源或宣稱Preview驗收完成。</summary>
    public sealed class ValidationContentPlayer : MonoBehaviour
    {
        private bool finished;
        private string root;
        private readonly List<AssetBundle> bundles = new List<AssetBundle>();
        private readonly Dictionary<string, AssetBundle> bundleIndex = new Dictionary<string, AssetBundle>();

        private IEnumerator Start()
        {
            UnityEngine.Application.runInBackground = true;
            var args = Environment.GetCommandLineArgs();
            int index = Array.IndexOf(args, "-validation-root");
            if (index < 0 || index + 1 >= args.Length || !Path.IsPathRooted(args[index + 1]))
            { UnityEngine.Application.Quit(2); yield break; }
            root = Path.GetFullPath(args[index + 1]);
            yield return null;
            var report = new JObject { ["passed"] = false, ["editorVersion"] = UnityEngine.Application.unityVersion };
            try
            {
                var plan = JObject.Parse(File.ReadAllText(SafeContent.Resolve(root, "player-plan.json")));
                report["requestDigest"] = plan["requestDigest"];
                report["planSha256"] = SafeContent.Hash(File.ReadAllBytes(SafeContent.Resolve(root, "player-plan.json")));
                if ((string)plan["purpose"] != "FrozenValidationContent") throw new InvalidDataException("ValidationPurposeMismatch");
                foreach (var file in (JArray)plan["bundles"])
                {
                    byte[] bytes = File.ReadAllBytes(SafeContent.Resolve(root, (string)file["key"]));
                    if (SafeContent.Hash(bytes) != (string)file["sha256"]) throw new InvalidDataException("BundleHashMismatch");
                    var bundle = AssetBundle.LoadFromFile(SafeContent.Resolve(root, (string)file["key"]));
                    if (bundle == null) throw new InvalidDataException("BundleLoadFailed");
                    bundles.Add(bundle);
                    bundleIndex.Add((string)file["key"], bundle);
                }
                var rows = new JArray();
                foreach (var item in (JArray)plan["models"])
                {
                    string bundleKey = (string)item["bundleKey"];
                    if (SafeContent.Hash(File.ReadAllBytes(SafeContent.Resolve(root, bundleKey))) != (string)item["bundleSha256"])
                        throw new InvalidDataException("ModelBundleBindingMismatch");
                    var prefab = bundleIndex[bundleKey].LoadAsset<GameObject>((string)item["assetName"]);
                    if (prefab == null) throw new InvalidDataException("PrefabMissing");
                    var instance = Instantiate(prefab);
                    try
                    {
                        var inspected = InspectModel(instance, (JArray)item["referenceDimensions"]);
                        inspected["revisionId"] = item["revisionId"];
                        inspected["bundleKey"] = bundleKey; inspected["bundleSha256"] = item["bundleSha256"];
                        inspected["assetName"] = item["assetName"];
                        var captures = new JArray(); var pixels = new JArray();
                        Vector3[] directions = { Vector3.forward, Vector3.back, Vector3.left, Vector3.right, Vector3.up, Vector3.down };
                        string[] names = { "front", "back", "left", "right", "top", "bottom" };
                        for (int side = 0; side < 6; side++)
                        {
                            string key = "captures/" + (string)item["revisionId"] + "/" + names[side] + ".png";
                            int visible = CaptureModel(instance, Camera.main, directions[side], SafeContent.Resolve(root, key));
                            pixels.Add(visible);
                            captures.Add(new JObject { ["key"] = key,
                                ["sha256"] = SafeContent.Hash(File.ReadAllBytes(SafeContent.Resolve(root, key))) });
                        }
                        inspected["captures"] = captures; inspected["visiblePixels"] = pixels;
                        rows.Add(inspected);
                    }
                    finally { DestroyImmediate(instance); }
                }
                if (rows.Count == 0) throw new InvalidDataException("EmptyValidation");
                report["models"] = rows; report["passed"] = true;
                report["graphicsDevice"] = SystemInfo.graphicsDeviceName;
                report["renderPipeline"] = GraphicsSettings.currentRenderPipeline?.GetType().FullName;
                report["captureMode"] = "PlayerCameraRenderRequest";
            }
            catch (Exception error) { report["failure"] = error.ToString(); }
            finally { foreach (var bundle in bundles) bundle.Unload(true); }
            Finish(report);
        }

        /// <summary>驗證非空真Mesh、材質、shader、貼圖UV及來源尺寸，不接受空集合。</summary>
        public static JObject InspectModel(GameObject instance, JArray dimensions)
        {
            var filters = instance.GetComponentsInChildren<MeshFilter>(true);
            var renderers = instance.GetComponentsInChildren<MeshRenderer>(true);
            if (filters.Length == 0 || renderers.Length == 0 || dimensions == null || dimensions.Count != 3)
                throw new InvalidDataException("MissingMeshOrDimensions");
            if (filters.Any(f => f.sharedMesh == null || f.sharedMesh.vertexCount < 3 || f.sharedMesh.triangles.Length < 3))
                throw new InvalidDataException("EmptyMesh");
            foreach (var renderer in renderers)
            {
                if (renderer.sharedMaterials.Length == 0) throw new InvalidDataException("MissingMaterial");
                foreach (var material in renderer.sharedMaterials)
                {
                    if (material == null || material.shader == null || !material.shader.isSupported
                        || material.shader.name == "Hidden/InternalErrorShader") throw new InvalidDataException("MissingOrErrorShader");
                    bool textured = material.GetTexturePropertyNames().Any(p => material.GetTexture(p) != null);
                    var mesh = renderer.GetComponent<MeshFilter>()?.sharedMesh;
                    if (textured && (mesh == null || mesh.uv.Length != mesh.vertexCount)) throw new InvalidDataException("MissingTextureUv");
                }
            }
            Bounds bounds = renderers[0].bounds;
            foreach (var renderer in renderers.Skip(1)) bounds.Encapsulate(renderer.bounds);
            for (int axis = 0; axis < 3; axis++)
            {
                float expected = (float)dimensions[axis];
                if (!float.IsFinite(expected) || expected <= 0 || !float.IsFinite(bounds.size[axis])
                    || Mathf.Abs(bounds.size[axis] - expected) > Mathf.Max(.0004f, expected * .03f))
                    throw new InvalidDataException("SourceDimensionsMismatch");
            }
            return new JObject { ["passed"] = true, ["meshCount"] = filters.Length,
                ["materialCount"] = renderers.Sum(r => r.sharedMaterials.Length),
                ["dimensionsVerified"] = true, ["materialsVerified"] = true,
                ["width"] = bounds.size.x, ["height"] = bounds.size.y, ["depth"] = bounds.size.z };
        }

        /// <summary>以六個實際相機方向驗證非空且非粉紅圖；每次建立新PNG。</summary>
        public static int CaptureModel(GameObject instance, Camera camera, Vector3 direction, string path)
        {
            var renderers = instance.GetComponentsInChildren<Renderer>(true);
            Bounds bounds = renderers[0].bounds;
            foreach (var renderer in renderers.Skip(1)) bounds.Encapsulate(renderer.bounds);
            float radius = Mathf.Max(.001f, bounds.extents.magnitude);
            camera.orthographic = true; camera.orthographicSize = radius * 1.15f;
            camera.nearClipPlane = .0001f; camera.farClipPlane = radius * 12;
            camera.transform.position = bounds.center + direction * radius * 4;
            camera.transform.LookAt(bounds.center, Mathf.Abs(direction.y) > .9f ? Vector3.forward : Vector3.up);
            camera.clearFlags = CameraClearFlags.SolidColor; camera.backgroundColor = new Color(.09f, .13f, .17f);
            var target = RenderTexture.GetTemporary(512, 512, 24, RenderTextureFormat.ARGB32);
            var prior = RenderTexture.active;
            var texture = new Texture2D(512, 512, TextureFormat.RGB24, false);
            try
            {
                RenderPipeline.SubmitRenderRequest(camera, new UniversalRenderPipeline.SingleCameraRequest { destination = target });
                RenderTexture.active = target; texture.ReadPixels(new Rect(0, 0, 512, 512), 0, 0); texture.Apply();
                var values = texture.GetPixels32();
                var background = values[0];
                int visible = values.Count(p => Math.Abs(p.r - background.r) + Math.Abs(p.g - background.g) + Math.Abs(p.b - background.b) > 24);
                if (visible < 64 || values.Count(p => p.r > 200 && p.b > 200 && p.g < 50) > 20)
                    throw new InvalidDataException("BlankOrErrorShaderCapture");
                Directory.CreateDirectory(Path.GetDirectoryName(path));
                using (var stream = new FileStream(path, FileMode.CreateNew))
                { byte[] bytes = texture.EncodeToPNG(); stream.Write(bytes, 0, bytes.Length); }
                return visible;
            }
            finally { RenderTexture.active = prior; RenderTexture.ReleaseTemporary(target); DestroyImmediate(texture); }
        }

        private void Update()
        {
            if (!finished && Time.realtimeSinceStartup > 180)
                Finish(new JObject { ["passed"] = false, ["failure"] = "PlayerValidationTimeout" });
        }
        private void Finish(JObject report)
        {
            if (finished) return;
            finished = true;
            if (root != null)
                using (var stream = new StreamWriter(new FileStream(Path.Combine(root, "player-report.json"), FileMode.CreateNew)))
                    stream.Write(report.ToString());
            Debug.Log("BRICKHIGH_VALIDATION_PLAYER " + report);
            UnityEngine.Application.Quit((bool?)report["passed"] == true ? 0 : 3);
        }
    }
}
#endif
