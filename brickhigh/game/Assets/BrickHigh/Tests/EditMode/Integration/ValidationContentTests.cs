#if UNITY_EDITOR
using System;
using System.IO;
using BrickHigh.UnityRuntime;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using UnityEngine;

namespace BrickHigh.Tests
{
    /// <summary>真Unity Mesh/Material與六視圖檢查；只使用臨時測試幾何，不改QA審查。</summary>
    public sealed class ValidationContentTests
    {
        [Test]
        public void FrozenValidation_RealMeshAndMaterials_PassSourceDimensions()
        {
            var cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
            try
            {
                cube.transform.localScale = new Vector3(.008f, .0096f, .004f);
                var result = ValidationContentPlayer.InspectModel(cube, new JArray(.008, .0096, .004));
                Assert.That((bool)result["passed"], Is.True);
                Assert.That((int)result["meshCount"], Is.EqualTo(1));
            }
            finally { UnityEngine.Object.DestroyImmediate(cube); }
        }

        [Test]
        public void FrozenValidation_MissingMaterialOrWrongDimensions_Rejects()
        {
            var cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
            try
            {
                Assert.Throws<InvalidDataException>(() => ValidationContentPlayer.InspectModel(cube, new JArray(.008, .0096, .004)));
                cube.GetComponent<MeshRenderer>().sharedMaterials = new Material[] { null };
                Assert.Throws<InvalidDataException>(() => ValidationContentPlayer.InspectModel(cube, new JArray(1, 1, 1)));
            }
            finally { UnityEngine.Object.DestroyImmediate(cube); }
        }

        [Test]
        public void FrozenValidation_EmptyRoot_RejectsInsteadOfPassingEmptySet()
        {
            var empty = new GameObject("Empty validation test");
            try { Assert.Throws<InvalidDataException>(() => ValidationContentPlayer.InspectModel(empty, new JArray(1, 1, 1))); }
            finally { UnityEngine.Object.DestroyImmediate(empty); }
        }
    }
}
#endif
