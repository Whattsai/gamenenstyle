using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using BrickHigh.Domain;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;

namespace BrickHigh.Tests
{
    /// <summary>以實際 Gate 2 GLB、glTFast Editor 匯入結果與 Unity MeshCollider 驗證座標及插接空腔。</summary>
    public sealed class RealGltfConnectorIntegrationTests
    {
        private readonly List<GameObject> roots = new List<GameObject>();
        private string generatedRoot;

        [SetUp]
        public void SetUp()
        {
            generatedRoot = "Assets/BrickHigh/Tests/EditMode/GeneratedRealGltf-" + Guid.NewGuid().ToString("N");
            Directory.CreateDirectory(AssetPathToFullPath(generatedRoot));
        }

        [TearDown]
        public void TearDown()
        {
            foreach (var root in roots)
                if (root != null) UnityEngine.Object.DestroyImmediate(root);
            roots.Clear();
            AssetDatabase.DeleteAsset(generatedRoot);
        }

        [TestCase("3001-red-exploratory-v1", "conversion.json", "geometry")]
        [TestCase("pm-20260923-asymmetric-slope-3298-materials-v2", "conversion.json", "geometry")]
        [TestCase("pm-20260927-expansion-v1/3005-colour14", "metadata.json", null)]
        [NUnit.Framework.Property("TDD", "IT-004")]
        public void CoordinateAndConnectors_RealGltf_RuntimeBoundsRemainWithinRecordedTolerance(
            string modelFolder, string metadataFile, string boundsParent)
        {
            var root = ImportRealModel(modelFolder);
            var actual = RendererBounds(root).size;
            var expected = ReadRecordedDimensions(modelFolder, metadataFile, boundsParent);
            Debug.Log($"IT004_BOUNDS model={modelFolder} expected=({expected.x:R},{expected.y:R},{expected.z:R}) actual=({actual.x:R},{actual.y:R},{actual.z:R}) meshes={root.GetComponentsInChildren<MeshFilter>(true).Length}");

            Assert.That(MetadataValidationPolicy.DimensionMatches(expected.x, actual.x), Is.True,
                $"X 尺寸超出 SPEC 容差：expected={expected.x:R}, actual={actual.x:R}");
            Assert.That(MetadataValidationPolicy.DimensionMatches(expected.y, actual.y), Is.True,
                $"Y 尺寸超出 SPEC 容差：expected={expected.y:R}, actual={actual.y:R}");
            Assert.That(MetadataValidationPolicy.DimensionMatches(expected.z, actual.z), Is.True,
                $"Z 尺寸超出 SPEC 容差：expected={expected.z:R}, actual={actual.z:R}");
            Assert.That(root.GetComponentsInChildren<MeshFilter>(true).Length, Is.GreaterThan(0), "真實 GLB 必須產生 mesh。");
        }

        [Test, NUnit.Framework.Property("TDD", "IT-004"), NUnit.Framework.Property("TDD", "UT-021")]
        public void CoordinateAndConnectors_AsymmetricSlope_KeepsAsymmetryAndConsistentWinding()
        {
            var root = ImportRealModel("pm-20260923-asymmetric-slope-3298-materials-v2");
            var points = WorldVertices(root).ToArray();
            Assert.That(points.Length, Is.GreaterThan(0));

            var bounds = RendererBounds(root);
            var center = bounds.center;
            var xMirrorCoverage = MirrorCoverage(points, center, true);
            var zMirrorCoverage = MirrorCoverage(points, center, false);
            Assert.That(Math.Min(xMirrorCoverage, zMirrorCoverage), Is.LessThan(0.985),
                "3298 真實模型至少一個水平軸必須保留非對稱幾何，避免匯入後被誤鏡像成對稱件。");

            var winding = WindingAgreement(root);
            Debug.Log($"IT004_ASYMMETRY xMirror={xMirrorCoverage:R} zMirror={zMirrorCoverage:R} triangles={winding.checkedTriangles} windingConsistency={winding.agreement:R}");
            Assert.That(winding.checkedTriangles, Is.GreaterThan(100), "需要足夠真實三角形才能驗證 winding。 ");
            Assert.That(winding.agreement, Is.GreaterThan(0.90),
                $"真實非對稱 GLB 的幾何 winding 與 vertex normals 缺乏一致方向：{winding.agreement:P2}");
        }

        [Test, NUnit.Framework.Property("TDD", "IT-004"), NUnit.Framework.Property("TDD", "UT-022"), NUnit.Framework.Property("TDD", "UT-023")]
        public void CoordinateAndConnectors_RealStudProbe_FitsImportedBrickCavities()
        {
            var upper = ImportRealModel("3001-red-exploratory-v1");
            var lower = ImportRealModel("pm-20260927-expansion-v1/3005-colour14");
            var upperBounds = RendererBounds(upper);
            var lowerPoints = WorldVertices(lower).ToArray();

            var studPoints = lowerPoints.Where(point => point.y > 0.0001f).ToArray();
            Assert.That(studPoints.Length, Is.GreaterThan(20), "3005 真實 GLB 必須能辨識出高於磚面之 stud 幾何。 ");
            var studMinX = studPoints.Min(point => point.x);
            var studMaxX = studPoints.Max(point => point.x);
            var studMinZ = studPoints.Min(point => point.z);
            var studMaxZ = studPoints.Max(point => point.z);
            var studMaxY = studPoints.Max(point => point.y);
            var studRadius = Math.Min(studMaxX - studMinX, studMaxZ - studMinZ) / 2f;
            Debug.Log($"IT004_STUD points={studPoints.Length} x=({studMinX:R},{studMaxX:R}) z=({studMinZ:R},{studMaxZ:R}) maxY={studMaxY:R} radius={studRadius:R}");
            Assert.That(studRadius, Is.InRange(0.0022f, 0.0026f), "實際 3005 stud 半徑應落在可辨識的 LDraw 幾何範圍。 ");

            upper.transform.position += Vector3.up * -upperBounds.min.y;
            Debug.Log("IT004_COLLIDER_BEGIN");
            try
            {
                AddMeshColliders(upper);
                Debug.Log($"IT004_COLLIDER_ADDED count={upper.GetComponentsInChildren<MeshCollider>(true).Length}");
                Physics.SyncTransforms();
                Debug.Log($"IT004_COLLIDERS count={upper.GetComponentsInChildren<MeshCollider>(true).Length} upperBounds={RendererBounds(upper)}");
            }
            catch (Exception exception)
            {
                Debug.Log($"IT004_COLLIDER_EXCEPTION type={exception.GetType().FullName} message={exception.Message}");
                throw;
            }

            var profiles = new Dictionary<string, ConnectorProfileDefinition>
            {
                ["system-stud-v1"] = new ConnectorProfileDefinition(
                    "system-stud-v1", new[] { "system-tube-v1" }, new[] { "axial-insert" }),
                ["system-tube-v1"] = new ConnectorProfileDefinition(
                    "system-tube-v1", new[] { "system-stud-v1" }, new[] { "axial-insert" })
            };
            var canPair = ConnectorCompatibilityPolicy.CanPair("system-stud-v1", "system-tube-v1", profiles);
            Debug.Log($"IT004_PAIR canPair={canPair}");
            Assert.That(canPair, Is.True);

            var probeRadius = studRadius - 0.00005f;
            var probeStartY = 0.00015f;
            var probeEndY = Math.Max(probeStartY + 0.0002f, studMaxY - 0.00015f);
            foreach (var x in new[] { -0.012f, -0.004f, 0.004f, 0.012f })
            foreach (var z in new[] { -0.004f, 0.004f })
            {
                var start = new Vector3(x, probeStartY, z);
                var end = new Vector3(x, probeEndY, z);
                var hit = HitsFixture(upper, start, end, probeRadius);
                Debug.Log($"IT004_CAVITY x={x:R} z={z:R} radius={probeRadius:R} startY={probeStartY:R} endY={probeEndY:R} hit={hit}");
                Assert.That(hit, Is.False,
                    $"3001 的實際 MeshCollider 在 stud/tube 配對位置 ({x:R},{z:R}) 封死插接空腔。 ");
            }

            var controlHit = HitsFixture(upper,
                new Vector3(0, probeStartY, 0.0074f),
                new Vector3(0, probeEndY, 0.0074f),
                probeRadius);
            Debug.Log($"IT004_CAVITY_CONTROL hit={controlHit} radius={probeRadius:R}");
            Assert.That(controlHit, Is.True,
                "控制反例必須撞到 3001 外側實體壁，否則 cavity 測試沒有辨識力。 ");
        }

        private GameObject ImportRealModel(string modelFolder)
        {
            var source = Path.Combine(BrickHighRoot(), "artifacts", "models", modelFolder.Replace('/', Path.DirectorySeparatorChar), "model.glb");
            Assert.That(File.Exists(source), Is.True, "缺少 Gate 2 真實 GLB：" + source);
            var safeName = modelFolder.Replace('/', '-').Replace('\\', '-');
            var assetPath = generatedRoot + "/" + safeName + ".glb";
            File.Copy(source, AssetPathToFullPath(assetPath), false);
            AssetDatabase.ImportAsset(assetPath, ImportAssetOptions.ForceSynchronousImport);
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(assetPath);
            Assert.That(prefab, Is.Not.Null, "glTFast Editor importer 未產生 GameObject：" + modelFolder);

            var wrapper = new GameObject("IT-004 real glTF - " + safeName);
            roots.Add(wrapper);
            var instance = UnityEngine.Object.Instantiate(prefab, wrapper.transform);
            instance.name = "Imported glTF";
            // 與 ToolchainProbeBuild 相同：glTFast 已翻 X，此處只用 Y 軸 180° 純旋轉對齊專案翻 Z 契約。
            instance.transform.localRotation = Quaternion.Euler(0, 180, 0) * instance.transform.localRotation;
            return wrapper;
        }

        private static void AddMeshColliders(GameObject root)
        {
            foreach (var filter in root.GetComponentsInChildren<MeshFilter>(true))
            {
                if (filter.sharedMesh == null) continue;
                var collider = filter.gameObject.GetComponent<MeshCollider>();
                if (collider == null) collider = filter.gameObject.AddComponent<MeshCollider>();
                collider.sharedMesh = filter.sharedMesh;
                collider.convex = false;
            }
        }

        private static bool HitsFixture(GameObject root, Vector3 start, Vector3 end, float radius)
        {
            return Physics.OverlapCapsule(start, end, radius, ~0, QueryTriggerInteraction.Ignore)
                .Any(collider => collider != null && (collider.gameObject == root || collider.transform.IsChildOf(root.transform)));
        }

        private static Bounds RendererBounds(GameObject root)
        {
            var renderers = root.GetComponentsInChildren<Renderer>(true);
            Assert.That(renderers.Length, Is.GreaterThan(0), "匯入模型沒有 Renderer。 ");
            var bounds = renderers[0].bounds;
            for (var i = 1; i < renderers.Length; i++) bounds.Encapsulate(renderers[i].bounds);
            return bounds;
        }

        private static IEnumerable<Vector3> WorldVertices(GameObject root)
        {
            foreach (var filter in root.GetComponentsInChildren<MeshFilter>(true))
            {
                var mesh = filter.sharedMesh;
                if (mesh == null) continue;
                foreach (var vertex in mesh.vertices) yield return filter.transform.TransformPoint(vertex);
            }
        }

        private static double MirrorCoverage(IReadOnlyList<Vector3> points, Vector3 center, bool mirrorX)
        {
            const float quantum = 0.00002f;
            var set = new HashSet<string>(points.Select(point => Key(point, quantum)));
            var matched = 0;
            foreach (var point in points)
            {
                var mirrored = mirrorX
                    ? new Vector3(2 * center.x - point.x, point.y, point.z)
                    : new Vector3(point.x, point.y, 2 * center.z - point.z);
                if (set.Contains(Key(mirrored, quantum))) matched++;
            }
            return points.Count == 0 ? 0 : (double)matched / points.Count;
        }

        private static string Key(Vector3 point, float quantum) =>
            Math.Round(point.x / quantum) + ":" + Math.Round(point.y / quantum) + ":" + Math.Round(point.z / quantum);

        private static (int checkedTriangles, double agreement) WindingAgreement(GameObject root)
        {
            var checkedTriangles = 0;
            var aligned = 0;
            foreach (var filter in root.GetComponentsInChildren<MeshFilter>(true))
            {
                var mesh = filter.sharedMesh;
                if (mesh == null || mesh.normals == null || mesh.normals.Length != mesh.vertexCount) continue;
                var vertices = mesh.vertices;
                var normals = mesh.normals;
                var triangles = mesh.triangles;
                for (var i = 0; i + 2 < triangles.Length; i += 3)
                {
                    var i0 = triangles[i];
                    var i1 = triangles[i + 1];
                    var i2 = triangles[i + 2];
                    var a = filter.transform.TransformPoint(vertices[i0]);
                    var b = filter.transform.TransformPoint(vertices[i1]);
                    var c = filter.transform.TransformPoint(vertices[i2]);
                    var geometric = Vector3.Cross(b - a, c - a);
                    if (geometric.sqrMagnitude < 1e-16f) continue;
                    geometric.Normalize();
                    var normal = filter.transform.TransformDirection(normals[i0] + normals[i1] + normals[i2]);
                    if (normal.sqrMagnitude < 1e-12f) continue;
                    normal.Normalize();
                    checkedTriangles++;
                    if (Vector3.Dot(geometric, normal) > 0) aligned++;
                }
            }
            if (checkedTriangles == 0) return (0, 0);
            var sameDirectionRatio = (double)aligned / checkedTriangles;
            // Unity front-face 採 clockwise；Cross 的正負號不應硬編成品質規則，只要求整體 winding 與 normals 有一致關係。
            return (checkedTriangles, Math.Max(sameDirectionRatio, 1d - sameDirectionRatio));
        }

        private static Vector3 ReadRecordedDimensions(string modelFolder, string metadataFile, string boundsParent)
        {
            var path = Path.Combine(BrickHighRoot(), "artifacts", "models", modelFolder.Replace('/', Path.DirectorySeparatorChar), metadataFile);
            Assert.That(File.Exists(path), Is.True, "缺少幾何證據：" + path);
            var document = JObject.Parse(File.ReadAllText(path));
            var bounds = boundsParent == null ? document["boundsMeters"] : document[boundsParent]?["boundsMeters"];
            Assert.That(bounds, Is.Not.Null, "證據未包含 boundsMeters：" + path);
            var min = (JArray)bounds["min"];
            var max = (JArray)bounds["max"];
            return new Vector3(
                (float)((double)max[0] - (double)min[0]),
                (float)((double)max[1] - (double)min[1]),
                (float)((double)max[2] - (double)min[2]));
        }

        private static string BrickHighRoot() => Path.GetFullPath(Path.Combine(UnityEngine.Application.dataPath, "..", ".."));

        private static string AssetPathToFullPath(string assetPath) =>
            Path.Combine(Path.GetDirectoryName(UnityEngine.Application.dataPath), assetPath.Replace('/', Path.DirectorySeparatorChar));
    }
}
