// Meshy exports quantized, metallic=1 meshes: bake the first mesh to float geometry (feet at y=0) with a non-metal material.
export function bakeMesh(T, root) {
  let src; root.updateMatrixWorld(true); root.traverse(o => { if (!src && o.isMesh) src = o; });
  const geo = new T.BufferGeometry(), get = ['getX', 'getY', 'getZ', 'getW']; // interleaved attributes have no getComponent
  ['position', 'normal', 'uv'].forEach(k => {
    const at = src.geometry.attributes[k]; if (!at) return;
    const arr = new Float32Array(at.count * at.itemSize);
    for (let i = 0; i < at.count; i++) for (let c = 0; c < at.itemSize; c++) arr[i * at.itemSize + c] = at[get[c]](i);
    geo.setAttribute(k, new T.BufferAttribute(arr, at.itemSize));
  });
  geo.setIndex(src.geometry.index); geo.applyMatrix4(src.matrixWorld);
  geo.computeBoundingBox(); geo.translate(0, -geo.boundingBox.min.y, 0); geo.computeBoundingBox(); geo.computeBoundingSphere();
  const mat = src.material; mat.metalness = 0; mat.metalnessMap = null; mat.side = T.FrontSide; mat.needsUpdate = true;
  return { geo, mat };
}
