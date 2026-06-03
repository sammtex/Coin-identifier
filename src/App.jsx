import { useState, useRef, useCallback } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null);
    setError(null);
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setBase64(e.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const analyze = async () => {
    if (!base64 || !apiKey) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: `أنت خبير في النقود والعملات القديمة. حلل هذه العملة وقدم تقريراً باللغة العربية يتضمن:

🌍 تحديد العملة: الدولة، الفئة، السنة، المادة
📜 المعلومات التاريخية: الحقبة الزمنية والسياق
💰 القيمة التحصيلية: شائعة أم نادرة؟ القيمة حسب الحالة (مستعملة / جيدة / ممتازة)
⭐ التوصية: هل تستحق الاحتفاظ بها؟` }
            ]
          }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "خطأ في الاتصال");
      setResult(data.content[0]?.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null); setBase64(null);
    setResult(null); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", color:"#E8E0D0",
      fontFamily:"Cairo, sans-serif", direction:"rtl", padding:"0 0 3rem" }}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 1.5rem" }}>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"3rem 0 2rem" }}>
          <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🪙</div>
          <h1 style={{ fontSize:"2rem", fontWeight:900, color:"#C9A84C", margin:"0 0 0.5rem" }}>
            مُعرِّف العملات
          </h1>
          <p style={{ color:"#8A8070", fontSize:"0.9rem" }}>
            ارفع صورة أي عملة لمعرفة هويتها وقيمتها التحصيلية
          </p>
        </div>

        {/* API Key Input */}
        <div style={{ marginBottom:"1.5rem" }}>
          <label style={{ display:"block", marginBottom:"0.5rem", fontSize:"0.85rem", color:"#8A8070" }}>
            🔑 مفتاح Anthropic API
          </label>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              width:"100%", padding:"0.8rem 1rem",
              background:"#111", border:"1px solid #333",
              borderRadius:10, color:"#E8E0D0",
              fontFamily:"monospace", fontSize:"0.9rem",
              outline:"none"
            }}
          />
          <p style={{ fontSize:"0.75rem", color:"#555", marginTop:"0.4rem" }}>
            احصل على مفتاحك من console.anthropic.com
          </p>
        </div>

        {/* Upload */}
        {!image ? (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border:"2px dashed #8B6914", borderRadius:16,
              padding:"3rem 2rem", textAlign:"center", cursor:"pointer",
              background:"#111"
            }}
          >
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📷</div>
            <p style={{ fontWeight:600, marginBottom:"0.5rem" }}>اضغط لرفع صورة العملة</p>
            <p style={{ color:"#8A8070", fontSize:"0.85rem" }}>JPG, PNG, WEBP</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
              onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div style={{ position:"relative" }}>
            <img src={image} alt="العملة" style={{
              width:"100%", maxHeight:280, objectFit:"contain",
              borderRadius:12, background:"#111", display:"block"
            }} />
            <button onClick={reset} style={{
              position:"absolute", top:10, left:10,
              background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.2)",
              color:"white", borderRadius:"50%", width:32, height:32, cursor:"pointer"
            }}>✕</button>
          </div>
        )}

        {/* Analyze Button */}
        {image && !loading && (
          <button onClick={analyze} disabled={!apiKey} style={{
            width:"100%", padding:"1rem",
            background: apiKey ? "linear-gradient(135deg, #8B6914, #C9A84C, #E8C96A)" : "#333",
            color: apiKey ? "#0A0A0A" : "#666",
            border:"none", borderRadius:12, fontFamily:"inherit",
            fontSize:"1.05rem", fontWeight:700, cursor: apiKey ? "pointer" : "not-allowed",
            marginTop:"1.5rem"
          }}>
            🔍 تحليل العملة وتقدير قيمتها
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"3rem 0" }}>
            <div style={{
              width:50, height:50, border:"3px solid #222",
              borderTop:"3px solid #C9A84C", borderRadius:"50%",
              margin:"0 auto 1.5rem", animation:"spin 1s linear infinite"
            }} />
            <p style={{ color:"#8A8070" }}>جاري تحليل العملة...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background:"rgba(180,50,50,0.1)", border:"1px solid rgba(180,50,50,0.3)",
            borderRadius:12, padding:"1rem 1.5rem", marginTop:"1.5rem", color:"#ff8080"
          }}>⚠️ {error}</div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            background:"#111", border:"1px solid #242424",
            borderRadius:16, overflow:"hidden", marginTop:"2rem"
          }}>
            <div style={{
              background:"#1A1A1A", padding:"1rem 1.5rem",
              borderBottom:"1px solid rgba(201,168,76,0.2)",
              display:"flex", alignItems:"center", gap:"0.8rem"
            }}>
              <span style={{
                background:"linear-gradient(135deg, #8B6914, #C9A84C)",
                color:"#0A0A0A", padding:"0.3rem 0.8rem",
                borderRadius:20, fontSize:"0.8rem", fontWeight:700
              }}>✦ النتيجة</span>
              <span style={{ color:"#E8C96A", fontWeight:600 }}>تقرير تحليل العملة</span>
            </div>
            <div style={{ padding:"1.5rem", lineHeight:1.9, whiteSpace:"pre-wrap" }}>
              {result}
            </div>
          </div>
        )}

        {result && (
          <button onClick={reset} style={{
            width:"100%", padding:"0.8rem", background:"transparent",
            border:"1px solid #242424", borderRadius:10, color:"#8A8070",
            fontFamily:"inherit", fontSize:"0.9rem", cursor:"pointer", marginTop:"1rem"
          }}>↩ تحليل عملة جديدة</button>
        )}

      </div>
    </div>
  );
        }
