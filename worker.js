import { Resend } from 'resend';

// ─── Cloudflare Worker Entry Point ────────────────────────────────────────────
// Routes /api/submit-estimate → email handler
// Everything else → static assets (your built React app)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── API route ──────────────────────────────────────────────────────────────
    if (url.pathname === '/api/submit-estimate') {
      if (request.method === 'POST') {
        return handleSubmitEstimate(request, env);
      }
      return new Response('Method Not Allowed', { status: 405 });
    }

    // ── Static assets (React SPA) ──────────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};

// ─── Email Handler ─────────────────────────────────────────────────────────────
async function handleSubmitEstimate(request, env) {
  try {
    const payload = await request.json();
    const {
      contact,
      answers,
      estimateTotal,
      thumbnails,
      areaThumbnails,
      rawAreas,
      lineItems,
      notes,
    } = payload;

    const fmt = (val) => {
      if (val === undefined || val === null || val === '') return '—';
      if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
      return String(val);
    };

    const row = (label, value) => {
      const display = fmt(value);
      if (display === '—') return '';
      return `<tr>
        <td style="padding:6px 12px;color:#64748b;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:6px 12px;color:#0f172a;">${display}</td>
      </tr>`;
    };

    // NEW: build per-area photo blocks + descriptions from rawAreas/areaThumbnails
    const buildAreaExtrasHtml = () => {
      if (!areaThumbnails || Object.keys(areaThumbnails).length === 0) return '';
      let html = '';
      Object.entries(areaThumbnails).forEach(([areaName, imgs]) => {
        if (!imgs || !imgs.length) return;

        let description = '';
        if (rawAreas) {
          const match = areaName.match(/(\w+) Area (\d+)/);
          if (match) {
            const type = match[1].toLowerCase();
            const idx = parseInt(match[2], 10) - 1;
            const areaObj = rawAreas?.[type]?.[idx];
            if (areaObj) description = areaObj.repairDescription || areaObj.projectDescription || '';
          }
        }

        html += `
          <div style="margin:16px 0;">
            <h4 style="margin:0 0 6px;font-size:13px;color:#0f172a;">${areaName}</h4>
            ${description ? `<p style="margin:0 0 8px;font-size:12px;color:#64748b;font-style:italic;">${description}</p>` : ''}
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${imgs.map((src, i) => `<img src="${src}" alt="${areaName} photo ${i + 1}" style="width:90px;height:90px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;" />`).join('')}
            </div>
          </div>`;
      });
      return html;
    };

    const buildLineItemsTable = () => {
      if (!lineItems || lineItems.length === 0) {
        return `<div style="padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;color:#64748b;font-size:13px;">No scope of work items were added.</div>`;
      }
      let table = `
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="text-align:left;padding:10px 12px;font-weight:700;color:#334155;border-bottom:1px solid #e2e8f0;">Area</th>
              <th style="text-align:left;padding:10px 12px;font-weight:700;color:#334155;border-bottom:1px solid #e2e8f0;">Description</th>
              <th style="text-align:right;padding:10px 12px;font-weight:700;color:#334155;border-bottom:1px solid #e2e8f0;">Detail</th>
            </tr>
          </thead>
          <tbody>`;
      lineItems.forEach((item) => {
        const detail = item.detail || (item.quantity && item.unit ? `${item.quantity} ${item.unit}` : '');
        table += `
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 12px;color:#64748b;vertical-align:top;">${item.area || ''}</td>
            <td style="padding:8px 12px;color:#0f172a;vertical-align:top;">${item.label || ''}</td>
            <td style="padding:8px 12px;text-align:right;color:#475569;vertical-align:top;">${detail}</td>
          </tr>`;
      });
      table += `</tbody></table>`;
      return table;
    };

    const html = `
      <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;color:#334155;">
        <div style="background:linear-gradient(135deg,#2F9BF0,#1E86D8);padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;color:#fff;font-size:22px;">New Estimate Request Submitted</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">A client has submitted their project details through the online calculator.</p>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="font-size:16px;color:#0f172a;border-bottom:2px solid #2F9BF0;padding-bottom:8px;margin:0 0 16px;">Customer Information</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            ${row('Name', contact?.fullName || contact?.clientName)}
            ${row('Company', contact?.companyName)}
            ${row('Phone', contact?.phoneNumber || contact?.clientPhone)}
            ${row('Email', contact?.emailAddress || contact?.clientEmail)}
            ${row('Address', contact?.clientAddress || answers?.address)}
            ${row('ZIP Code', answers?.zipcode)}
            ${row('Commercial Project', contact?.isCommercial)}
            ${row('Subcontractor', contact?.isSubcontractor)}
          </table>

          <h2 style="font-size:16px;color:#0f172a;border-bottom:2px solid #2F9BF0;padding-bottom:8px;margin:24px 0 16px;">Scope of Work</h2>
          ${buildLineItemsTable()}
          ${buildAreaExtrasHtml()}

          ${answers?.services?.drywall ? `
            <h3 style="font-size:14px;color:#f97316;margin:20px 0 12px;">Drywall Details</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#fafafa;border-radius:8px;">
              ${row('Drywall Areas', answers.drywall_area)}
              ${row('Drywall Type', answers.drywall_type)}
              ${row('Wall Sqft', answers.drywall_wall_sqft)}
              ${row('Ceiling Sqft', answers.drywall_ceiling_sqft)}
              ${row('Bathroom Wall Sqft', answers.drywall_bathroom_wall_sqft)}
              ${row('Bathroom Ceiling Sqft', answers.drywall_bathroom_ceiling_sqft)}
              ${row('Demo Wall Sqft', answers.drywall_demo_wall_sqft)}
              ${row('Demo Ceiling Sqft', answers.drywall_demo_ceiling_sqft)}
              ${row('Demo Insulation Sqft', answers.drywall_demo_insulation_sqft)}
              ${row('Demo Baseboard Ft', answers.drywall_demo_baseboard_ft)}
              ${row('Soffits Sqft', answers.drywall_soffits_sqft)}
              ${row('Soffit Type', answers.soffit_type)}
              ${row('Soffit Linear Feet', answers.soffit_linear_feet)}
              ${row('Ceiling Height > 8ft', answers.ceiling_height_greater_than_8ft)}
              ${row('Ceiling Height (ft)', answers.ceiling_height_specify)}
              ${row('Vaulted Ceiling', answers.drywall_vaulted_ceiling)}
              ${row('Vaulted Width', answers.drywall_vaulted_width)}
              ${row('Vaulted Height', answers.drywall_vaulted_height)}
              ${row('Corner Metal', answers.drywall_corner_metal)}
              ${row('Corner Metal Type', answers.corner_metal_type)}
              ${row('Corner Metal Length', answers.corner_metal_length)}
              ${row('Corner Metal Qty', answers.drywall_corner_metal_qty)}
              ${row('Corner Count', answers.drywall_corner_count)}
              ${row('Arch Needed', answers.arch_needed)}
              ${row('Arch Count', answers.arch_count)}
              ${row('Texture', answers.drywall_texture)}
              ${row('Existing Texture', answers.drywall_existing_texture)}
              ${row('Insulation', answers.drywall_insulation)}
              ${row('Two Story', answers.is_two_story)}
            </table>` : ''}

          ${answers?.services?.paint ? `
            <h3 style="font-size:14px;color:#000;margin:20px 0 12px;">Paint Details</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#fafafa;border-radius:8px;">
              ${row('Paint Areas', answers.paint_area)}
              ${row('Primer', answers.paint_primer)}
              ${row('Wall Sqft', answers.paint_wall_sqft)}
              ${row('Ceiling Sqft', answers.paint_ceiling_sqft)}
              ${row('Bath Ceiling Sqft', answers.paint_bath_ceiling_sqft)}
              ${row('Bath Wall Sqft', answers.paint_bath_wall_sqft)}
              ${row('Trim Areas', answers.paint_trim_area)}
              ${row('Trim Linear Ft', answers.paint_trim_linear_ft)}
              ${row('Baseboards Linear Ft', answers.paint_baseboards_linear_ft)}
              ${row('Ceiling Height > 8ft', answers.paint_ceiling_height_over_8ft)}
              ${row('Paint Ceiling Height', answers.paint_ceiling_height)}
              ${row('Customer Providing Paint', answers.paint_customer_providing)}
              ${row('Contractor Providing Paint', answers.paint_contractor_providing)}
              ${row('Match Existing Color', answers.paint_match_existing)}
              ${row('Paint Brand / Color', answers.paint_brand_color)}
              ${row('Paint Color Explorer', answers.paintColorExplorer)}
              ${row('Paint Sheen', answers.paintSheen)}
              ${row('Paint Additional Info', answers.paint_additional_info)}
            </table>` : ''}

          ${answers?.services?.trim ? `
            <h3 style="font-size:14px;color:#10b981;margin:20px 0 12px;">Trim &amp; Baseboard Details</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#fafafa;border-radius:8px;">
              ${row('Trim Services', answers.trim_services)}
              ${row('Baseboard Height', answers.trim_baseboard_height)}
              ${row('Baseboard Product', answers.baseboard_product_name)}
              ${row('Base Material', answers.trim_base_material)}
              ${row('Base Linear Feet', answers.trim_base_linear_feet)}
              ${row('Base Primed', answers.trim_base_primed)}
              ${row('Casing Material', answers.trim_casing_material)}
              ${row('Casing Size', answers.trim_casing)}
              ${row('Casing Linear Feet', answers.trim_casing_linear_feet)}
              ${row('Casing Primed', answers.trim_casing_primed)}
            </table>` : ''}

          ${answers?.services?.electrical || answers?.electrical_services ? `
            <h3 style="font-size:14px;color:#eab308;margin:20px 0 12px;">Electrical Details</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#fafafa;border-radius:8px;">
              ${row('Electrical Services', answers.electrical_services)}
              ${row('Light Size', answers.electrical_light_size)}
              ${row('Light Count', answers.electrical_light_count)}
              ${row('Fan Count', answers.electrical_fan_count)}
              ${row('Fixture Count', answers.electrical_fixture_count)}
            </table>` : ''}

          <h2 style="font-size:16px;color:#0f172a;border-bottom:2px solid #2F9BF0;padding-bottom:8px;margin:24px 0 16px;">General Info</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            ${row('Room Occupied', answers?.is_occupied)}
            ${row('Emergency Job', answers?.is_emergency)}
            ${row('Late Day', answers?.is_late_day)}
            ${row('Additional Notes', notes)}
          </table>

          <div style="background:linear-gradient(135deg,#f0f9ff,#eff6ff);border:2px solid #2F9BF0;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <div style="font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Estimated Grand Total</div>
            <div style="font-size:32px;font-weight:900;color:#2F9BF0;margin-top:8px;">$${estimateTotal || '0.00'}</div>
          </div>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
          <p style="font-size:12px;color:#94a3b8;text-align:center;">
            Generated by Farley Construction &amp; Development Estimate Calculator<br />
            ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
          </p>
        </div>
      </div>
    `;

    const attachments = [];
    if (thumbnails && thumbnails.length > 0) {
      thumbnails.forEach((thumb, idx) => {
        if (typeof thumb === 'string' && thumb.startsWith('data:')) {
          const matches = thumb.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Content = matches[2];
            const ext = mimeType.split('/')[1] || 'jpg';
            attachments.push({
              filename: `project_photo_${idx + 1}.${ext}`,
              content: base64Content,
              content_type: mimeType,
            });
          }
        }
      });
    }

    const resendApiKey = env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set in Worker environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server misconfiguration: RESEND_API_KEY not set in Cloudflare' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailPayload = {
      from: 'Drywall@farleycdinc.com',
      to: 'kanhardik106@gmail.com',
      subject: `New Estimate Request — ${contact?.fullName || contact?.clientName || 'Client'} — $${estimateTotal}`,
      html,
    };
    if (attachments.length > 0) emailPayload.attachments = attachments;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });
    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      return new Response(
        JSON.stringify({ success: false, error: `Resend API Error: ${resendData?.message || JSON.stringify(resendData)}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: resendData }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Unexpected error in submit-estimate:', err);
    return new Response(
      JSON.stringify({ success: false, error: `Worker crash: ${err?.message || 'Internal server error'}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
