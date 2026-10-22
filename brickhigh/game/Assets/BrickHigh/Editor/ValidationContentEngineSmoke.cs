using System;
using System.IO;
using System.Text;
using BrickHigh.Infrastructure;
using Newtonsoft.Json.Linq;

namespace BrickHigh.Editor
{
    /// <summary>獨立合成立方體的真Windows Player測試；不讀QA、不核准Pending、不建立正式驗證紀錄。</summary>
    public static class ValidationContentEngineSmoke
    {
        /// <summary>只供開發回歸；沒有對外MCP task，輸出明確testOnly。</summary>
        public static void Run()
        {
            string project = Path.GetFullPath("..");
            string id = DateTime.UtcNow.ToString("yyyyMMddTHHmmss") + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);
            string key = "artifacts/acceptance/validation-content-engine-test/" + id;
            string output = SafeContent.Resolve(project, key);
            Directory.CreateDirectory(Path.Combine(output, "sources"));
            byte[] bytes = CubeGlb();
            File.WriteAllBytes(Path.Combine(output, "sources/cube.glb"), bytes);
            var inputs = new JObject { ["testOnly"] = true, ["purpose"] = "ContractTestValidation",
                ["requestDigest"] = SafeContent.Hash(Encoding.UTF8.GetBytes("test-only-" + id)),
                ["request"] = new JObject { ["editorVersion"] = UnityEngine.Application.unityVersion,
                    ["packageLockDigest"] = SafeContent.Hash(File.ReadAllBytes("Packages/packages-lock.json")) },
                ["models"] = new JArray(new JObject { ["revisionId"] = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                    ["modelKey"] = "sources/cube.glb", ["modelSha256"] = SafeContent.Hash(bytes),
                    ["metadata"] = new JObject { ["referenceDimensions"] = new JArray(.008, .0096, .004) } }) };
            File.WriteAllText(Path.Combine(output, "inputs.json"), inputs.ToString());
            ValidationContentBuild.BuildPreparedContent(project, id, key, inputs, true);
            UnityEngine.Debug.Log("BRICKHIGH_VALIDATION_TEST_ONLY " + output);
        }

        private static byte[] CubeGlb()
        {
            float[] positions = { 0,0,0, .008f,0,0, .008f,.0096f,0, 0,.0096f,0,
                0,0,-.004f, .008f,0,-.004f, .008f,.0096f,-.004f, 0,.0096f,-.004f };
            ushort[] indices = { 0,1,2,0,2,3,4,6,5,4,7,6,0,3,7,0,7,4,1,5,6,1,6,2,3,2,6,3,6,7,0,4,5,0,5,1 };
            byte[] binary;
            using (var stream = new MemoryStream())
            {
                using (var writer = new BinaryWriter(stream))
                { foreach (float value in positions) writer.Write(value); foreach (ushort value in indices) writer.Write(value); }
                binary = stream.ToArray();
            }
            var document = new JObject { ["asset"] = new JObject { ["version"] = "2.0" }, ["scene"] = 0,
                ["scenes"] = new JArray(new JObject { ["nodes"] = new JArray(0) }), ["nodes"] = new JArray(new JObject { ["mesh"] = 0 }),
                ["buffers"] = new JArray(new JObject { ["byteLength"] = binary.Length }),
                ["bufferViews"] = new JArray(new JObject { ["buffer"] = 0, ["byteOffset"] = 0, ["byteLength"] = 96 },
                    new JObject { ["buffer"] = 0, ["byteOffset"] = 96, ["byteLength"] = 72 }),
                ["accessors"] = new JArray(new JObject { ["bufferView"] = 0, ["componentType"] = 5126, ["count"] = 8,
                    ["type"] = "VEC3", ["min"] = new JArray(0,0,-.004), ["max"] = new JArray(.008,.0096,0) },
                    new JObject { ["bufferView"] = 1, ["componentType"] = 5123, ["count"] = 36, ["type"] = "SCALAR" }),
                ["materials"] = new JArray(new JObject { ["name"] = "ContractTestRed", ["pbrMetallicRoughness"] = new JObject {
                    ["baseColorFactor"] = new JArray(.8,.1,.05,1), ["metallicFactor"] = 0, ["roughnessFactor"] = .5 } }),
                ["meshes"] = new JArray(new JObject { ["primitives"] = new JArray(new JObject { ["attributes"] = new JObject { ["POSITION"] = 0 },
                    ["indices"] = 1, ["material"] = 0 }) }) };
            byte[] json = Encoding.UTF8.GetBytes(document.ToString(Newtonsoft.Json.Formatting.None));
            int length = (json.Length + 3) & ~3;
            using (var stream = new MemoryStream())
            {
                using (var writer = new BinaryWriter(stream))
                {
                    writer.Write(0x46546c67); writer.Write(2); writer.Write(12+8+length+8+binary.Length);
                    writer.Write(length); writer.Write(0x4e4f534a); writer.Write(json);
                    for (int i=json.Length;i<length;i++) writer.Write((byte)32);
                    writer.Write(binary.Length); writer.Write(0x004e4942); writer.Write(binary);
                }
                return stream.ToArray();
            }
        }
    }
}
