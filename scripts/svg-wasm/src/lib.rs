use wasm_bindgen::prelude::*;
#[cfg(feature = "svg")]
#[wasm_bindgen]
pub fn svg_normalize(source: &str) -> Result<String, JsValue> {
    let (doc, mut warnings) = vectorcraft_svg::import_with_report(source).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let options = vectorcraft_svg::ExportOptions { decimals: 7, ..Default::default() };
    let (svg, export_warnings) = vectorcraft_svg::export_with_report(&doc, &options);
    warnings.extend(export_warnings);
    serde_json::to_string(&serde_json::json!({"svg": svg, "warnings": warnings})).map_err(|e| JsValue::from_str(&e.to_string()))
}
#[cfg(feature = "render")]
#[wasm_bindgen]
pub fn render_document(json: &str, width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
    let doc: vectorcraft_doc::Document = serde_json::from_str(json).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(vectorcraft_render::Renderer::new().render(&doc, width.min(4096), height.min(4096), kurbo::Affine::IDENTITY, &Default::default()).pixels)
}
