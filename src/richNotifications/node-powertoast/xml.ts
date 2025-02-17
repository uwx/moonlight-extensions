import { parse } from "./option.js";

function imgResolve(imgPath) { // Resolve filePath only
  return imgPath;
}

function escape(string) {
  return string.replace(/[<>&'"]/g, match => {
    switch (match) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
    }
  });
}

function addAttributeOrTrim(name, value) {
  return value ? `${name}="${value}" ` : "";
}

function xmlStringBuilder(options) {

  let template = "<toast " +
    `displayTimestamp="${new Date(options.time).toISOString()}" ` +
    `scenario="${options.scenario}" ` +
    `duration="${options.longTime ? "long" : "short"}" ` +
    `activationType="${options.activation.type}" ` +
    addAttributeOrTrim("launch", options.activation.launch) +
    addAttributeOrTrim("ProtocolActivationTargetApplicationPfn", options.activation.pfn) +
    addAttributeOrTrim("useButtonStyle", options.button.some(button => button.style)) +
    ">";

  // Toast header
  if (options.group) {
    template += "<header " +
      `id="${options.group.id}" ` + // ⚠️ required
      `title="${escape(options.group.title)}" ` + // ⚠️ required
      `arguments="${options.group.activation.launch}" ` + // ⚠️ required
      `activationType="${options.group.activation.type}" ` + // Only Foreground and Protocol are supported;
      addAttributeOrTrim("ProtocolActivationTargetApplicationPfn", options.group.activation.pfn) +
      "/>";
  }

  // Visual
  template += `<visual><binding template="ToastGeneric">`;
  if (options.icon) template += `<image placement="appLogoOverride" src="${imgResolve(options.icon)}" hint-crop="${options.cropIcon ? "circle" : "none"}"/>`;
  if (options.heroImg) template += `<image placement="hero" src="${imgResolve(options.heroImg)}"/>`;
  if (options.inlineImg) template += `<image src="${imgResolve(options.inlineImg)}"/>`;
  template += `<text><![CDATA[${options.title}]]></text>` +
    `<text><![CDATA[${options.message}]]></text>`;
  if (options.attribution) template += `<text placement="attribution"><![CDATA[${options.attribution}]]></text>`;

  // Progress bar
  if (options.progress) {
    template += "<progress " +
      `value="${options.progress.value}" ` +
      `status="${escape(options.progress.status)}" ` + // ⚠️ required
      addAttributeOrTrim("title", escape(options.progress.title)) +
      addAttributeOrTrim("valueStringOverride", escape(options.progress.valueOverride)) +
      "/>";
  }
  template += "</binding></visual>";

  // Actions
  template += "<actions>";
  // Inputs
  for (const [i, input] of [...options.input, ...options.select].entries()) {
    if (i > 4) break; // You can only have up to 5 inputs; Ignoring after max count reached

    template += "<input " +
      `id="${input.id}" ` + // ⚠️ required
      addAttributeOrTrim("title", escape(input.title)) +
      addAttributeOrTrim("defaultInput", input.default);

    if (input.items) { // Selection
      template += `type="selection" >`;
      for (const [j, select] of input.items.entries()) {
        if (j > 4) break; // You can only have up to 5 select; Ignoring after max count reached
        template += "<selection " +
          `id="${select.id}" ` + // ⚠️ required
          `content="${escape(select.text)}" ` + // ⚠️ required
          "/>";
      }
      template += "</input>";
    } else {
      template += `type="text" ` +
        addAttributeOrTrim("placeHolderContent", escape(input.placeholder)) +
        "/>";
    }
  }
  // Buttons
  for (const [i, button] of options.button.entries()) {
    if (i > 4) break; // You can only have up to 5 buttons; Ignoring after max count reached
    template += "<action " +
      `content="${escape(button.text)}" ` + // ⚠️ required
      `arguments="${button.activation.launch}" ` + // ⚠️ required
      `activationType="${button.activation.type}" ` +
      addAttributeOrTrim("afterActivationBehavior", button.activation.behavior) +
      addAttributeOrTrim("ProtocolActivationTargetApplicationPfn", button.activation.pfn);

    if (button.contextMenu) {
      template += `placement="contextMenu" `;
    } else {
      template += addAttributeOrTrim("imageUri", imgResolve(button.icon)) +
        addAttributeOrTrim("hint-inputId", button.id) + // corresponding input ID eg: quick reply
        addAttributeOrTrim("hint-toolTip", escape(button.tooltip)) + // win11
        addAttributeOrTrim("hint-buttonStyle", button.style); // win11
    }
    template += "/>";
  }
  template += "</actions>";

  // Audio
  template += "<audio " +
    `silent="${options.silent}" ` +
    `loop="${options.loopAudio}" ` +
    addAttributeOrTrim("src", options.audio) +
    "/>";

  // EOF
  template += "</toast>";

  return template;
}

function toXmlString(option = {}) {
  const options = parse(option);
  return xmlStringBuilder(options);
}

export { toXmlString, xmlStringBuilder };
