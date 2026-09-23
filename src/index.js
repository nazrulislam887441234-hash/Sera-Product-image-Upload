export default {
  async fetch(request, env) {
    // CORS Configuration - Production ready
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://seraproduct.com", // For dev, you can use "*" temporarily
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    try {
      const requestData = await request.formData();
      const imageFile = requestData.get("image");

      if (!imageFile) {
        return new Response(JSON.stringify({ success: false, error: "No image provided" }), { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // Prepare request for ImgBB
      const imgbbFormData = new FormData();
      imgbbFormData.append("key", env.IMGBB_API_KEY);
      imgbbFormData.append("image", imageFile);

      // Call ImgBB API
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: imgbbFormData
      });

      const result = await response.json();

      if (result.success) {
        return new Response(JSON.stringify({ success: true, url: result.data.url }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ success: false, error: result.error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
