using System;
using System.Collections;
using System.IO;
using System.Linq;
using BrickHigh.Domain;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
#if UNITY_EDITOR
using UnityEditor;
#endif

namespace BrickHigh.Tests
{
    /// <summary>以真實 glTFast Editor importer 驗證帶 normal／tangent 的 glTF 不會被二次鏡像破壞手性。</summary>
    public sealed class CoordinateTangentImportTests
    {
        private string generatedRoot;
        private GameObject instanceRoot;

        [SetUp]
        public void SetUp()
        {
#if UNITY_EDITOR
            generatedRoot = "Assets/BrickHigh/Tests/PlayMode/GeneratedTangentGltf-" + Guid.NewGuid().ToString("N");
            Directory.CreateDirectory(AssetPathToFullPath(generatedRoot));
#endif
        }

        [TearDown]
        public void TearDown()
        {
            if (instanceRoot != null) UnityEngine.Object.DestroyImmediate(instanceRoot);
#if UNITY_EDITOR
            if (!string.IsNullOrWhiteSpace(generatedRoot)) AssetDatabase.DeleteAsset(generatedRoot);
#endif
        }

        [UnityTest, NUnit.Framework.Property("TDD", "IT-004")]
        public IEnumerator RunCoordinateTangentImport_ScenarioMatrix_PreservesContract()
        {
            yield return null;
            Assert.That(UnityEngine.Application.isPlaying, Is.True, "IT-004 tangent 正例必須在真正 PlayMode 執行。 ");
#if UNITY_EDITOR
            var root = ImportGeneratedTangentFixture();
            var meshes = root.GetComponentsInChildren<MeshFilter>(true)
                .Where(filter => filter.sharedMesh != null)
                .Select(filter => filter.sharedMesh)
                .ToArray();
            Assert.That(meshes, Has.Length.EqualTo(1), "tangent fixture 應只產生一個 mesh。 ");

            var mesh = meshes[0];
            Assert.That(mesh.vertexCount, Is.EqualTo(3));
            Assert.That(mesh.normals, Has.Length.EqualTo(mesh.vertexCount), "glTFast 匯入後必須保留逐頂點 normal。 ");
            Assert.That(mesh.tangents, Has.Length.EqualTo(mesh.vertexCount), "glTFast 匯入後必須保留逐頂點 tangent。 ");

            for (var index = 0; index < mesh.vertexCount; index++)
            {
                var normal = mesh.normals[index];
                var tangent4 = mesh.tangents[index];
                var tangent = new Vector3(tangent4.x, tangent4.y, tangent4.z);
                Assert.That(normal.magnitude, Is.EqualTo(1f).Within(0.0001f), "normal 必須保持正規化。 ");
                Assert.That(tangent.magnitude, Is.EqualTo(1f).Within(0.0001f), "tangent xyz 必須保持正規化。 ");
                Assert.That(Mathf.Abs(Vector3.Dot(normal, tangent)), Is.LessThan(0.0001f), "normal 與 tangent 必須保持正交。 ");
                Assert.That(Mathf.Abs(tangent4.w), Is.EqualTo(1f).Within(0.0001f), "tangent handedness w 必須保持 ±1。 ");
            }

            Assert.That(mesh.tangents.Select(tangent => Mathf.Sign(tangent.w)).Distinct().Count(), Is.EqualTo(1),
                "同一 primitive 的 tangent handedness 不得在 glTFast 匯入後混成不同符號。 ");

            var triangles = mesh.triangles;
            Assert.That(triangles, Has.Length.EqualTo(3));
            var vertices = mesh.vertices;
            var geometricNormal = Vector3.Cross(
                vertices[triangles[1]] - vertices[triangles[0]],
                vertices[triangles[2]] - vertices[triangles[0]]).normalized;
            var averagedNormal = (mesh.normals[triangles[0]] + mesh.normals[triangles[1]] + mesh.normals[triangles[2]]).normalized;
            Assert.That(Mathf.Abs(Vector3.Dot(geometricNormal, averagedNormal)), Is.GreaterThan(0.999f),
                "glTFast 匯入後 winding 與 vertex normals 必須保持一致方向關係。 ");

            Assert.That(CoordinatePolicy.TangentHandedness(1, false), Is.EqualTo(-1),
                "測試必須同時綁定本專案 canonical→Unity 的 tangent handedness 契約。 ");
            Assert.That(CoordinatePolicy.TriangleToUnity(new[] { 0, 1, 2 }, false), Is.EqualTo(new[] { 0, 2, 1 }),
                "測試必須同時綁定本專案 canonical→Unity 的 triangle winding 契約。 ");

            Debug.Log($"IT004_TANGENT_POSITIVE vertices={mesh.vertexCount} tangents={mesh.tangents.Length} handedness={mesh.tangents[0].w:R} windingDot={Vector3.Dot(geometricNormal, averagedNormal):R}");
#else
            Assert.Fail("IT-004 tangent 正例目前固定由 Unity Editor PlayMode runner 驗證 glTFast 匯入結果。 ");
#endif
            yield return null;
        }

#if UNITY_EDITOR
        private GameObject ImportGeneratedTangentFixture()
        {
            const string fixtureName = "it004-tangent-positive";
            var gltfAssetPath = generatedRoot + "/" + fixtureName + ".gltf";

            var geometry = new[]
            {
                // POSITION
                -0.5f, -0.5f, 0f,
                 0.5f, -0.5f, 0f,
                 0f,   0.5f, 0f,
                // TEXCOORD_0
                 0f,   0f,
                 1f,   0f,
                 0.5f, 1f,
                // NORMAL
                 0f, 0f, 1f,
                 0f, 0f, 1f,
                 0f, 0f, 1f,
                // TANGENT
                 1f, 0f, 0f, 1f,
                 1f, 0f, 0f, 1f,
                 1f, 0f, 0f, 1f
            };
            var geometryBytes = new byte[geometry.Length * sizeof(float)];
            System.Buffer.BlockCopy(geometry, 0, geometryBytes, 0, geometryBytes.Length);
            var encodedGeometry = Convert.ToBase64String(geometryBytes);
            var gltf = "{\n"
                + "  \"asset\": {\"version\": \"2.0\"},\n"
                + "  \"buffers\": [{\"uri\": \"data:application/octet-stream;base64," + encodedGeometry + "\", \"byteLength\": 144}],\n"
                + "  \"bufferViews\": [{\"buffer\":0,\"byteOffset\":0,\"byteLength\":36},{\"buffer\":0,\"byteOffset\":36,\"byteLength\":24},{\"buffer\":0,\"byteOffset\":60,\"byteLength\":36},{\"buffer\":0,\"byteOffset\":96,\"byteLength\":48}],\n"
                + "  \"accessors\": [{\"bufferView\":0,\"componentType\":5126,\"count\":3,\"type\":\"VEC3\",\"min\":[-0.5,-0.5,0],\"max\":[0.5,0.5,0]},{\"bufferView\":1,\"componentType\":5126,\"count\":3,\"type\":\"VEC2\"},{\"bufferView\":2,\"componentType\":5126,\"count\":3,\"type\":\"VEC3\"},{\"bufferView\":3,\"componentType\":5126,\"count\":3,\"type\":\"VEC4\"}],\n"
                + "  \"materials\": [{\"doubleSided\":true,\"pbrMetallicRoughness\":{\"baseColorFactor\":[0.8,0.2,0.2,1],\"metallicFactor\":0,\"roughnessFactor\":1}}],\n"
                + "  \"meshes\": [{\"primitives\":[{\"attributes\":{\"POSITION\":0,\"TEXCOORD_0\":1,\"NORMAL\":2,\"TANGENT\":3},\"material\":0}]}],\n"
                + "  \"nodes\": [{\"mesh\":0}],\n"
                + "  \"scenes\": [{\"nodes\":[0]}],\n"
                + "  \"scene\": 0\n"
                + "}\n";
            File.WriteAllText(AssetPathToFullPath(gltfAssetPath), gltf);
            AssetDatabase.ImportAsset(gltfAssetPath, ImportAssetOptions.ForceSynchronousImport);
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(gltfAssetPath);
            Assert.That(prefab, Is.Not.Null, "glTFast Editor importer 未產生 tangent-bearing GameObject。 ");

            instanceRoot = new GameObject("IT-004 tangent-bearing glTF");
            var instance = UnityEngine.Object.Instantiate(prefab, instanceRoot.transform);
            instance.name = "Imported tangent-bearing glTF";
            return instanceRoot;
        }
#endif

        private static string AssetPathToFullPath(string assetPath) =>
            Path.Combine(Path.GetDirectoryName(UnityEngine.Application.dataPath), assetPath.Replace('/', Path.DirectorySeparatorChar));
    }
}
