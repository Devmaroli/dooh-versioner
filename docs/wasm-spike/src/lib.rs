use wasm_bindgen::prelude::*;
#[cfg(feature = "svg")]
#[wasm_bindgen]
pub fn svg_roundtrip(source: &str) -> Result<String, JsValue> {
    let doc = vectorcraft_svg::import(source).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(vectorcraft_svg::export(&doc, &Default::default()))
}
#[cfg(feature = "render")]
#[wasm_bindgen]
pub fn render_document(json: &str, width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
    let doc: vectorcraft_doc::Document = serde_json::from_str(json).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(vectorcraft_render::Renderer::new().render(&doc, width.min(4096), height.min(4096), kurbo::Affine::IDENTITY, &Default::default()).pixels)
}
