const imageInput = document.getElementById("imageInput");
const borderRange = document.getElementById("borderRange");
const bottomRange = document.getElementById("bottomRange");
const borderValue = document.getElementById("borderValue");
const bottomValue = document.getElementById("bottomValue");
const paperColor = document.getElementById("paperColor");
const textColor = document.getElementById("textColor");
const headlineInput = document.getElementById("headlineInput");
const sublineInput = document.getElementById("sublineInput");
const headlineFontSelect = document.getElementById("headlineFontSelect");
const sublineFontSelect = document.getElementById("sublineFontSelect");
const infoFontSelect = document.getElementById("infoFontSelect");
const headlineSizeRange = document.getElementById("headlineSizeRange");
const sublineSizeRange = document.getElementById("sublineSizeRange");
const infoSizeRange = document.getElementById("infoSizeRange");
const headlineSizeValue = document.getElementById("headlineSizeValue");
const sublineSizeValue = document.getElementById("sublineSizeValue");
const infoSizeValue = document.getElementById("infoSizeValue");
const headlineOffsetRange = document.getElementById("headlineOffsetRange");
const sublineOffsetRange = document.getElementById("sublineOffsetRange");
const infoOffsetRange = document.getElementById("infoOffsetRange");
const headlineOffsetValue = document.getElementById("headlineOffsetValue");
const sublineOffsetValue = document.getElementById("sublineOffsetValue");
const infoOffsetValue = document.getElementById("infoOffsetValue");
const cornerRadiusRange = document.getElementById("cornerRadiusRange");
const cornerRadiusValue = document.getElementById("cornerRadiusValue");
const useExifDate = document.getElementById("useExifDate");
const useExifCamera = document.getElementById("useExifCamera");
const exportRounded = document.getElementById("exportRounded");
const applyAllPhotos = document.getElementById("applyAllPhotos");
const exportButton = document.getElementById("exportButton");
const exportAllButton = document.getElementById("exportAllButton");
const resetButton = document.getElementById("resetButton");
const previewCanvas = document.getElementById("previewCanvas");
const dropZone = document.getElementById("dropZone");
const canvasStage = document.getElementById("canvasStage");
const canvasFrame = document.getElementById("canvasFrame");
const emptyState = document.getElementById("emptyState");
const imageMetaLabel = document.getElementById("imageMetaLabel");
const exportQualityRange = document.getElementById("exportQualityRange");
const exportQualityValue = document.getElementById("exportQualityValue");
const exportQualityControl = document.getElementById("exportQualityControl");
const exportSizeSelect = document.getElementById("exportSizeSelect");
const clearAllPhotosButton = document.getElementById("clearAllPhotosButton");
const clearPhotoButton = document.getElementById("clearPhotoButton");
const templateList = document.getElementById("templateList");
const infoControlsRow = document.getElementById("infoControlsRow");
const uploadButton = document.getElementById("uploadButton");
const photoList = document.getElementById("photoList");
const photoCountLabel = document.getElementById("photoCountLabel");
const confirmDialog = document.getElementById("confirmDialog");
const confirmDialogMessage = document.getElementById("confirmDialogMessage");
const confirmCancelButton = document.getElementById("confirmCancelButton");
const confirmOkButton = document.getElementById("confirmOkButton");
const paperColorSection = paperColor.closest(".panel-section");

const ctx = previewCanvas.getContext("2d");

let currentFile = null;
let currentImage = null;
let currentExif = {};
let currentOrientation = 1;
let currentFileBuffer = null;
let currentTemplate = "classic";
let previewScale = 1;
let previewOffsetX = 0;
let previewOffsetY = 0;
let previewPointerId = null;
let previewDragStartX = 0;
let previewDragStartY = 0;
let previewDragOriginX = 0;
let previewDragOriginY = 0;
let photoItems = [];
let currentPhotoId = null;
let nextPhotoId = 1;
let previewWarmupHandle = null;
let renderPreviewFrame = null;

const PREVIEW_LONG_SIDE = 2400;
const MAX_PREVIEW_CACHE_ITEMS = 5;
const previewCache = new Map();

const fontMap = {
  yahei: '"Microsoft YaHei UI", "Microsoft YaHei", sans-serif',
  misans: '"MiSans", "Microsoft YaHei UI", sans-serif',
  angie: '"Angie Sans Std", "Helvetica Neue", "Arial", sans-serif',
  times: '"Times New Roman", Times, serif',
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

const templates = {
  classic: {
    border: 30,
    bottom: 30,
    headlineFont: "yahei",
    sublineFont: "times",
    infoFont: "times",
    headlineSize: 55,
    sublineSize: 55,
    infoSize: 48,
    headlineOffset: 20,
    sublineOffset: 37,
    infoOffset: 53,
    cornerRadius: 50,
    subline: "NIKON Zfc",
    paperColor: "#ffffff",
    textColor: "#4b433d",
  },
  classicAlt: {
    border: 41.5,
    bottom: 13.3,
    headlineFont: "yahei",
    sublineFont: "times",
    infoFont: "times",
    headlineSize: 72,
    sublineSize: 62,
    infoSize: 56,
    headlineOffset: 14,
    sublineOffset: 23,
    infoOffset: 32,
    cornerRadius: 50,
    subline: "NIKON Zfc",
    paperColor: "#ffffff",
    textColor: "#4b433d",
  },
  galleryDark: {
    border: 37,
    bottom: 35,
    headlineFont: "yahei",
    sublineFont: "times",
    infoFont: "times",
    headlineSize: 56,
    sublineSize: 55,
    infoSize: 48,
    headlineOffset: 5,
    sublineOffset: 30,
    infoOffset: 53,
    cornerRadius: 50,
    subline: "NIKON Zfc",
    paperColor: "#34362f",
    textColor: "#f2ead8",
  },
  galleryDarkPortrait: {
    border: 48.4,
    bottom: 22.3,
    headlineFont: "yahei",
    sublineFont: "times",
    infoFont: "times",
    headlineSize: 68,
    sublineSize: 76,
    infoSize: 48,
    headlineOffset: 6,
    sublineOffset: 19,
    infoOffset: 53,
    cornerRadius: 50,
    subline: "NIKON Zfc",
    paperColor: "#34362f",
    textColor: "#f2ead8",
  },
};

function getFontFamily(key) {
  return fontMap[key] || fontMap.yahei;
}

function enhanceSelect(select) {
  if (!select || select.dataset.customized === "true") {
    return;
  }

  select.dataset.customized = "true";
  select.classList.add("native-select");

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "custom-select-button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");

  const label = document.createElement("span");
  label.className = "custom-select-label";
  button.appendChild(label);

  const caret = document.createElement("span");
  caret.className = "custom-select-caret";
  caret.setAttribute("aria-hidden", "true");
  button.appendChild(caret);

  const menu = document.createElement("ul");
  menu.className = "custom-select-menu";
  menu.setAttribute("role", "listbox");

  const closeAllCustomSelects = () => {
    document.querySelectorAll(".custom-select.open").forEach((item) => {
      item.classList.remove("open");
      const trigger = item.querySelector(".custom-select-button");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  };

  const sync = () => {
    const selectedOption = select.options[select.selectedIndex];
    label.textContent = selectedOption ? selectedOption.textContent : "";
    menu.querySelectorAll(".custom-select-option").forEach((optionButton) => {
      optionButton.setAttribute("aria-selected", optionButton.dataset.value === select.value ? "true" : "false");
    });
  };

  Array.from(select.options).forEach((option) => {
    const item = document.createElement("li");
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "custom-select-option";
    optionButton.textContent = option.textContent;
    optionButton.dataset.value = option.value;
    optionButton.setAttribute("role", "option");
    optionButton.addEventListener("click", () => {
      select.value = option.value;
      sync();
      closeAllCustomSelects();
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    item.appendChild(optionButton);
    menu.appendChild(item);
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = wrapper.classList.contains("open");
    closeAllCustomSelects();
    if (!isOpen) {
      wrapper.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });

  select.addEventListener("change", sync);
  document.addEventListener("click", closeAllCustomSelects);

  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(button);
  wrapper.appendChild(menu);
  wrapper.appendChild(select);
  sync();
}

function applyTemplate(name) {
  const template = templates[name];
  if (!template) {
    return;
  }
  currentTemplate = name;
  const isYiyinTemplate = name === "galleryDark" || name === "galleryDarkPortrait";
  infoControlsRow.classList.toggle("template-hidden", isYiyinTemplate);
  paperColorSection.classList.toggle("template-hidden", isYiyinTemplate);

  borderRange.value = String(template.border);
  bottomRange.value = String(template.bottom);
  headlineFontSelect.value = template.headlineFont;
  sublineFontSelect.value = template.sublineFont;
  infoFontSelect.value = template.infoFont;
  headlineSizeRange.value = String(template.headlineSize);
  sublineSizeRange.value = String(template.sublineSize);
  infoSizeRange.value = String(template.infoSize);
  headlineOffsetRange.value = String(template.headlineOffset);
  sublineOffsetRange.value = String(template.sublineOffset);
  infoOffsetRange.value = String(template.infoOffset);
  cornerRadiusRange.value = String(template.cornerRadius);
  sublineInput.value = template.subline;
  if (template.paperColor) {
    paperColor.value = template.paperColor;
  }
  if (template.textColor) {
    textColor.value = template.textColor;
  }

  templateList.querySelectorAll(".template-card").forEach((button) => {
    button.classList.toggle("active", button.dataset.template === name);
  });
}

function updateLabels() {
  borderValue.textContent = `${borderRange.value}%`;
  bottomValue.textContent = `${bottomRange.value}%`;
  headlineSizeValue.textContent = `${headlineSizeRange.value}%`;
  sublineSizeValue.textContent = `${sublineSizeRange.value}%`;
  infoSizeValue.textContent = `${infoSizeRange.value}%`;
  headlineOffsetValue.textContent = `${headlineOffsetRange.value}%`;
  sublineOffsetValue.textContent = `${sublineOffsetRange.value}%`;
  infoOffsetValue.textContent = `${infoOffsetRange.value}%`;
  cornerRadiusValue.textContent = `${cornerRadiusRange.value}%`;
  exportQualityValue.textContent = `${exportQualityRange.value}%`;
}

function updateExportQualityState() {
  const isPngExport = exportRounded.checked;
  exportQualityRange.disabled = isPngExport;
  exportQualityControl.classList.toggle("is-disabled", isPngExport);
  exportQualityValue.textContent = isPngExport ? "PNG" : `${exportQualityRange.value}%`;
}

function getBottomPaddingPercent() {
  return Number(bottomRange.value) * 0.1;
}

function getBorderPaddingPercent() {
  return Number(borderRange.value) / 6;
}

function syncRangeFill(range) {
  const min = Number(range.min || 0);
  const max = Number(range.max || 100);
  const value = Number(range.value || 0);
  const percent = ((value - min) / (max - min)) * 100;
  range.style.setProperty("--range-progress", `${percent}%`);
}

function syncAllRangeFills() {
  [
    borderRange,
    bottomRange,
    exportQualityRange,
    headlineSizeRange,
    sublineSizeRange,
    infoSizeRange,
    headlineOffsetRange,
    sublineOffsetRange,
    infoOffsetRange,
    cornerRadiusRange,
  ].forEach(syncRangeFill);
}

function resetControls() {
  paperColor.value = "#ffffff";
  textColor.value = "#4b433d";
  headlineInput.value = "";
  exportQualityRange.value = "100";
  exportSizeSelect.value = "original";
  useExifDate.checked = true;
  useExifCamera.checked = true;
  exportRounded.checked = false;
  applyAllPhotos.checked = true;
  applyTemplate("classic");
  updateExportButtonLabel();
  updateExportButtonText();
  refreshExportButtonText();
  updatePreviewCornerRadius();
  updateLabels();
  updateExportQualityState();
  syncAllRangeFills();
}

function updateExportButtonLabel() {
  exportButton.textContent = exportRounded.checked ? "导出 PNG（圆角）" : "导出 JPG";
}

function updateExportButtonText() {
  exportButton.textContent = exportRounded.checked ? "导出 PNG（圆角）" : "导出 JPG";
}

function getCornerRadiusPercent() {
  return Number(cornerRadiusRange.value) / 100;
}

function getCornerRadiusPx(width, height) {
  const maxRadius = Math.min(width, height) * 0.08;
  return Math.round(maxRadius * getCornerRadiusPercent());
}

function updatePreviewCornerRadius() {
  if (!exportRounded.checked) {
    previewCanvas.style.borderRadius = "0px";
    return;
  }

  const width = previewCanvas.clientWidth || previewCanvas.width || 0;
  const height = previewCanvas.clientHeight || previewCanvas.height || 0;
  previewCanvas.style.borderRadius = `${getCornerRadiusPx(width, height)}px`;
}

function clampPreviewOffsets(scale = previewScale, offsetX = previewOffsetX, offsetY = previewOffsetY) {
  const frameRect = canvasFrame.getBoundingClientRect();
  const baseWidth = previewCanvas.offsetWidth;
  const baseHeight = previewCanvas.offsetHeight;
  const scaledWidth = baseWidth * scale;
  const scaledHeight = baseHeight * scale;
  const maxOffsetX = Math.max(0, (scaledWidth - frameRect.width) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - frameRect.height) / 2);

  return {
    x: Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX)),
    y: Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY)),
  };
}

function applyPreviewViewport() {
  const { x, y } = clampPreviewOffsets();
  previewOffsetX = x;
  previewOffsetY = y;
  previewCanvas.style.transform = `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale})`;
  canvasFrame.classList.toggle("is-zoomed", currentImage && previewScale > 1.001);
}

function resetPreviewViewport() {
  previewScale = 1;
  previewOffsetX = 0;
  previewOffsetY = 0;
  previewPointerId = null;
  applyPreviewViewport();
}

function refreshExportButtonText() {
  exportButton.textContent = exportRounded.checked ? "导出 PNG（圆角）" : "导出 JPG";
  exportAllButton.textContent = exportRounded.checked ? "全部导出 PNG" : "全部导出 JPG";
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const match = String(value).match(/^(\d{4})[:.](\d{2})[:.](\d{2})/);
  if (!match) {
    return String(value).trim();
  }
  return `${match[1]}.${Number(match[2])}.${Number(match[3])}`;
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  return String(value).trim().replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1.$2.$3");
}

function formatExposure(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  if (value >= 1) {
    return `${value.toFixed(1).replace(/\.0$/, "")}s`;
  }
  return `1/${Math.round(1 / value)}s`;
}

function formatAperture(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  return `f/${value.toFixed(1).replace(/\.0$/, "")}`;
}

function formatFocal(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  return `${value.toFixed(0)}mm`;
}

function readTagValue(view, entryOffset, type, count, littleEndian, tiffStart) {
  const sizes = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const unit = sizes[type];
  if (!unit) {
    return null;
  }

  const totalBytes = unit * count;
  const valueOffset = totalBytes <= 4 ? entryOffset + 8 : tiffStart + view.getUint32(entryOffset + 8, littleEndian);

  if (type === 2) {
    let text = "";
    for (let i = 0; i < count; i += 1) {
      const code = view.getUint8(valueOffset + i);
      if (code === 0) {
        break;
      }
      text += String.fromCharCode(code);
    }
    return text.trim();
  }

  if (type === 5 || type === 10) {
    const values = [];
    for (let i = 0; i < count; i += 1) {
      const base = valueOffset + i * 8;
      const numerator = type === 10 ? view.getInt32(base, littleEndian) : view.getUint32(base, littleEndian);
      const denominator = type === 10 ? view.getInt32(base + 4, littleEndian) : view.getUint32(base + 4, littleEndian);
      values.push(denominator ? numerator / denominator : 0);
    }
    return count === 1 ? values[0] : values;
  }

  const values = [];
  for (let i = 0; i < count; i += 1) {
    const base = valueOffset + i * unit;
    if (type === 1 || type === 7) {
      values.push(view.getUint8(base));
    } else if (type === 3) {
      values.push(view.getUint16(base, littleEndian));
    } else if (type === 4) {
      values.push(view.getUint32(base, littleEndian));
    } else if (type === 9) {
      values.push(view.getInt32(base, littleEndian));
    }
  }
  return count === 1 ? values[0] : values;
}

function parseIfd(view, start, littleEndian, tiffStart) {
  const entryCount = view.getUint16(start, littleEndian);
  const data = {};
  for (let i = 0; i < entryCount; i += 1) {
    const entryOffset = start + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    data[tag] = readTagValue(view, entryOffset, type, count, littleEndian, tiffStart);
  }
  return data;
}

function parseExif(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return {};
  }

  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset);
    offset += 2;

    if (marker === 0xffda || marker === 0xffd9) {
      break;
    }

    const length = view.getUint16(offset);
    if (marker !== 0xffe1) {
      offset += length;
      continue;
    }

    if (view.getUint32(offset + 2) !== 0x45786966) {
      offset += length;
      continue;
    }

    const tiffStart = offset + 8;
    const littleEndian = view.getUint16(tiffStart) === 0x4949;
    if (view.getUint16(tiffStart + 2, littleEndian) !== 42) {
      return {};
    }

    const ifdOffset = view.getUint32(tiffStart + 4, littleEndian);
    const baseIfd = parseIfd(view, tiffStart + ifdOffset, littleEndian, tiffStart);
    const exifIfdOffset = baseIfd[0x8769];
    const exifIfd = exifIfdOffset ? parseIfd(view, tiffStart + exifIfdOffset, littleEndian, tiffStart) : {};

    return {
      make: baseIfd[0x010f] || "",
      model: baseIfd[0x0110] || "",
      orientation: baseIfd[0x0112] || 1,
      modifyDate: baseIfd[0x0132] || "",
      dateTimeOriginal: exifIfd[0x9003] || "",
      createDate: exifIfd[0x9004] || "",
      lensModel: exifIfd[0xa434] || "",
      exposureTime: exifIfd[0x829a] || 0,
      fNumber: exifIfd[0x829d] || 0,
      iso: exifIfd[0x8827] || 0,
      focalLength: exifIfd[0x920a] || 0,
      pixelXDimension: exifIfd[0xa002] || 0,
      pixelYDimension: exifIfd[0xa003] || 0,
    };
  }

  return {};
}

function extractExifSegment(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      break;
    }

    const marker = (bytes[offset] << 8) | bytes[offset + 1];
    if (marker === 0xffda || marker === 0xffd9) {
      break;
    }

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) {
      break;
    }

    if (marker === 0xffe1) {
      const headerStart = offset + 4;
      const exifHeader =
        bytes[headerStart] === 0x45 &&
        bytes[headerStart + 1] === 0x78 &&
        bytes[headerStart + 2] === 0x69 &&
        bytes[headerStart + 3] === 0x66;
      if (exifHeader) {
        return bytes.slice(offset, offset + 2 + length);
      }
    }

    offset += 2 + length;
  }

  return null;
}

async function mergeExifIntoJpegBlob(jpegBlob, sourceBuffer) {
  const exifSegment = extractExifSegment(sourceBuffer);
  if (!exifSegment) {
    return jpegBlob;
  }

  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
  if (jpegBytes.length < 4 || jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
    return jpegBlob;
  }

  const merged = new Uint8Array(2 + exifSegment.length + (jpegBytes.length - 2));
  merged.set(jpegBytes.slice(0, 2), 0);
  merged.set(exifSegment, 2);
  merged.set(jpegBytes.slice(2), 2 + exifSegment.length);

  return new Blob([merged], { type: "image/jpeg" });
}

function cameraText() {
  return [String(currentExif.make || "").trim(), String(currentExif.model || "").trim()]
    .filter(Boolean)
    .join(" ");
}

function headlineText() {
  const manual = headlineInput.value.trim();
  const dateText = useExifDate.checked
    ? formatDate(currentExif.dateTimeOriginal || currentExif.createDate || currentExif.modifyDate)
    : "";

  if (manual && dateText) {
    return `${manual}  ${dateText}`;
  }
  return manual || dateText || (currentFile ? currentFile.name.replace(/\.[^.]+$/, "") : "未命名照片");
}

function sublineText() {
  const manual = sublineInput.value.trim();
  const lens = String(currentExif.lensModel || "").trim();
  if (manual) {
    if (useExifCamera.checked && lens) {
      return `${manual}  ${lens}`;
    }
    return manual;
  }
  if (!useExifCamera.checked) {
    return "";
  }
  return lens;
}

function exifLineText() {
  const parts = [];
  const aperture = formatAperture(Number(currentExif.fNumber));
  const exposure = formatExposure(Number(currentExif.exposureTime));
  const iso = currentExif.iso ? `ISO ${currentExif.iso}` : "";
  const focal = formatFocal(Number(currentExif.focalLength));

  if (aperture) {
    parts.push(aperture);
  }
  if (exposure) {
    parts.push(exposure);
  }
  if (iso) {
    parts.push(iso);
  }
  if (focal) {
    parts.push(focal);
  }

  return parts.join("   ");
}

function drawImageWithOrientation(targetCtx, image, box, orientation) {
  const rotated = [5, 6, 7, 8].includes(orientation);
  const sourceWidth = rotated ? image.naturalHeight : image.naturalWidth;
  const sourceHeight = rotated ? image.naturalWidth : image.naturalHeight;
  const scale = Math.min(box.width / sourceWidth, box.height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = box.x + (box.width - drawWidth) / 2;
  const y = box.y + (box.height - drawHeight) / 2;

  targetCtx.save();

  if (orientation === 6) {
    targetCtx.translate(x + drawWidth, y);
    targetCtx.rotate(Math.PI / 2);
    targetCtx.drawImage(image, 0, -drawWidth, drawHeight, drawWidth);
  } else if (orientation === 8) {
    targetCtx.translate(x, y + drawHeight);
    targetCtx.rotate(-Math.PI / 2);
    targetCtx.drawImage(image, -drawHeight, 0, drawHeight, drawWidth);
  } else if (orientation === 3) {
    targetCtx.translate(x + drawWidth, y + drawHeight);
    targetCtx.rotate(Math.PI);
    targetCtx.drawImage(image, 0, 0, drawWidth, drawHeight);
  } else if (orientation === 2) {
    targetCtx.translate(x + drawWidth, y);
    targetCtx.scale(-1, 1);
    targetCtx.drawImage(image, 0, 0, drawWidth, drawHeight);
  } else {
    targetCtx.drawImage(image, x, y, drawWidth, drawHeight);
  }

  targetCtx.restore();
}

function drawImageCoverWithOrientation(targetCtx, image, box, orientation) {
  const rotated = [5, 6, 7, 8].includes(orientation);
  const sourceWidth = rotated ? image.naturalHeight : image.naturalWidth;
  const sourceHeight = rotated ? image.naturalWidth : image.naturalHeight;
  const scale = Math.max(box.width / sourceWidth, box.height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = box.x + (box.width - drawWidth) / 2;
  const y = box.y + (box.height - drawHeight) / 2;

  targetCtx.save();

  if (orientation === 6) {
    targetCtx.translate(x + drawWidth, y);
    targetCtx.rotate(Math.PI / 2);
    targetCtx.drawImage(image, 0, -drawWidth, drawHeight, drawWidth);
  } else if (orientation === 8) {
    targetCtx.translate(x, y + drawHeight);
    targetCtx.rotate(-Math.PI / 2);
    targetCtx.drawImage(image, -drawHeight, 0, drawHeight, drawWidth);
  } else if (orientation === 3) {
    targetCtx.translate(x + drawWidth, y + drawHeight);
    targetCtx.rotate(Math.PI);
    targetCtx.drawImage(image, 0, 0, drawWidth, drawHeight);
  } else if (orientation === 2) {
    targetCtx.translate(x + drawWidth, y);
    targetCtx.scale(-1, 1);
    targetCtx.drawImage(image, 0, 0, drawWidth, drawHeight);
  } else {
    targetCtx.drawImage(image, x, y, drawWidth, drawHeight);
  }

  targetCtx.restore();
}

function roundedRectPath(targetCtx, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  targetCtx.beginPath();
  targetCtx.moveTo(x + safeRadius, y);
  targetCtx.arcTo(x + width, y, x + width, y + height, safeRadius);
  targetCtx.arcTo(x + width, y + height, x, y + height, safeRadius);
  targetCtx.arcTo(x, y + height, x, y, safeRadius);
  targetCtx.arcTo(x, y, x + width, y, safeRadius);
  targetCtx.closePath();
}

function drawImageFillWithOrientation(targetCtx, image, box, orientation) {
  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.rect(box.x, box.y, box.width, box.height);
  targetCtx.clip();

  const rotated = [5, 6, 7, 8].includes(orientation);
  const sourceWidth = rotated ? image.naturalHeight : image.naturalWidth;
  const sourceHeight = rotated ? image.naturalWidth : image.naturalHeight;
  const scaleX = box.width / sourceWidth;
  const scaleY = box.height / sourceHeight;

  if (orientation === 6) {
    targetCtx.translate(box.x + box.width, box.y);
    targetCtx.rotate(Math.PI / 2);
    targetCtx.scale(scaleY, scaleX);
    targetCtx.drawImage(image, 0, -image.naturalHeight, image.naturalWidth, image.naturalHeight);
  } else if (orientation === 8) {
    targetCtx.translate(box.x, box.y + box.height);
    targetCtx.rotate(-Math.PI / 2);
    targetCtx.scale(scaleY, scaleX);
    targetCtx.drawImage(image, -image.naturalWidth, 0, image.naturalWidth, image.naturalHeight);
  } else if (orientation === 3) {
    targetCtx.translate(box.x + box.width, box.y + box.height);
    targetCtx.rotate(Math.PI);
    targetCtx.scale(scaleX, scaleY);
    targetCtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  } else if (orientation === 2) {
    targetCtx.translate(box.x + box.width, box.y);
    targetCtx.scale(-scaleX, scaleY);
    targetCtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  } else {
    targetCtx.translate(box.x, box.y);
    targetCtx.scale(scaleX, scaleY);
    targetCtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  }

  targetCtx.restore();
}

function drawYiyinBlurBackground(targetCtx, image, width, height, orientation) {
  const sourceSize = 3025;
  const sourceCanvas = document.createElement("canvas");
  const blurCanvas = document.createElement("canvas");
  const passCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceSize;
  sourceCanvas.height = sourceSize;
  blurCanvas.width = sourceSize;
  blurCanvas.height = sourceSize;
  passCanvas.width = sourceSize;
  passCanvas.height = sourceSize;

  const sourceCtx = sourceCanvas.getContext("2d");
  const blurCtx = blurCanvas.getContext("2d");
  const passCtx = passCanvas.getContext("2d");
  drawImageFillWithOrientation(sourceCtx, image, { x: 0, y: 0, width: sourceSize, height: sourceSize }, orientation);

  blurCtx.imageSmoothingEnabled = true;
  blurCtx.imageSmoothingQuality = "high";
  blurCtx.drawImage(sourceCanvas, 0, 0);

  // Yiyin uses: resize 3025x3025 fit:fill -> ffmpeg boxblur=200:2 -> resize final fit:fill.
  // Canvas has no boxblur, so two strong passes with edge bleed are the closest browser-side match.
  const passes = [120, 120];
  const bleed = 420;
  passes.forEach((radius) => {
    passCtx.clearRect(0, 0, sourceSize, sourceSize);
    passCtx.save();
    passCtx.filter = `blur(${radius}px)`;
    passCtx.drawImage(blurCanvas, -bleed, -bleed, sourceSize + bleed * 2, sourceSize + bleed * 2);
    passCtx.restore();

    blurCtx.clearRect(0, 0, sourceSize, sourceSize);
    blurCtx.drawImage(passCanvas, 0, 0);
  });

  targetCtx.drawImage(blurCanvas, 0, 0, width, height);
}

function averageCanvasBrightness(targetCtx, width, height) {
  const sampleSize = 64;
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sampleSize;
  sampleCanvas.height = sampleSize;
  const sampleCtx = sampleCanvas.getContext("2d");
  sampleCtx.drawImage(targetCtx.canvas, 0, 0, width, height, 0, 0, sampleSize, sampleSize);
  const data = sampleCtx.getImageData(0, 0, sampleSize, sampleSize).data;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    total += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  return total / (sampleSize * sampleSize);
}

function yiyinOverlayColor(brightness) {
  if (brightness < 15) {
    return "rgba(180, 180, 180, 0.2)";
  }
  if (brightness < 20) {
    return "rgba(158, 158, 158, 0.2)";
  }
  if (brightness < 40) {
    return "rgba(128, 128, 128, 0.2)";
  }
  return "rgba(0, 0, 0, 0.2)";
}

function scaledImageSize() {
  return scaledImageSizeForMaxLongSide(2400);
}

function scaledImageSizeForMaxLongSide(maxLongSide) {
  const rotated = [5, 6, 7, 8].includes(currentOrientation);
  const width = rotated ? currentImage.naturalHeight : currentImage.naturalWidth;
  const height = rotated ? currentImage.naturalWidth : currentImage.naturalHeight;
  const longSide = Math.max(width, height);
  const scale = Number.isFinite(maxLongSide) && maxLongSide > 0 && longSide > maxLongSide
    ? maxLongSide / longSide
    : 1;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function renderGalleryDarkFrame(targetCanvas, maxLongSide, roundedCorners) {
  const targetCtx = targetCanvas.getContext("2d");
  const size = scaledImageSizeForMaxLongSide(maxLongSide);
  const outerPadding = Math.round(size.width * getBorderPaddingPercent() / 100);
  const topPadding = outerPadding;
  const outputWidth = size.width + outerPadding * 2;
  const titleLine = [headlineText(), exifLineText()].filter(Boolean).join("   ");
  const detailLine = sublineText() || "Nikon Z fc";
  const titleFontPx = Math.max(24, Math.round(outputWidth * 0.024 * (Number(headlineSizeRange.value) / 100)));
  const detailFontPx = Math.max(18, Math.round(outputWidth * 0.018 * (Number(sublineSizeRange.value) / 100)));
  const captionTopPadding = Math.round(outputWidth * 0.018);
  const titleLineHeight = Math.round(titleFontPx * 1.25);
  const detailLineHeight = Math.round(detailFontPx * 1.25);
  const captionExtraHeight = Math.max(0, Math.round(size.height * getBottomPaddingPercent() / 100));
  const minCaptionContentHeight = Math.max(titleLineHeight, detailLineHeight);
  const baseCaptionContentHeight = Math.max(Math.round(size.height * 0.18), minCaptionContentHeight);
  const lineAreaTop = topPadding + size.height + captionTopPadding;
  const lineAreaBottom = lineAreaTop + baseCaptionContentHeight;
  const titleTrackHeight = Math.max(0, lineAreaBottom - lineAreaTop - titleLineHeight);
  const detailTrackHeight = Math.max(0, lineAreaBottom - lineAreaTop - detailLineHeight);
  const titleY = lineAreaTop + titleTrackHeight * (Number(headlineOffsetRange.value) / 100);
  const detailY = lineAreaTop + detailTrackHeight * (Number(sublineOffsetRange.value) / 100);
  const textBottom = Math.max(titleY + titleLineHeight, detailY + detailLineHeight);
  const outputHeight = Math.ceil(textBottom + captionExtraHeight);
  const imageBox = {
    x: outerPadding,
    y: topPadding,
    width: size.width,
    height: size.height,
  };
  targetCanvas.width = outputWidth;
  targetCanvas.height = outputHeight;

  if (roundedCorners) {
    targetCtx.save();
    roundedRectPath(targetCtx, 0, 0, outputWidth, outputHeight, getCornerRadiusPx(outputWidth, outputHeight));
    targetCtx.clip();
  }

  drawYiyinBlurBackground(targetCtx, currentImage, outputWidth, outputHeight, currentOrientation);
  targetCtx.fillStyle = yiyinOverlayColor(averageCanvasBrightness(targetCtx, outputWidth, outputHeight));
  targetCtx.fillRect(0, 0, outputWidth, outputHeight);

  targetCtx.save();
  targetCtx.shadowColor = "rgba(0, 0, 0, 1)";
  targetCtx.shadowBlur = Math.ceil(imageBox.height * 0.06);
  targetCtx.shadowOffsetX = 0;
  targetCtx.shadowOffsetY = 0;
  targetCtx.fillStyle = "#000";
  targetCtx.fillRect(imageBox.x + 1, imageBox.y, imageBox.width - 2, imageBox.height - 2);
  targetCtx.restore();

  targetCtx.save();
  drawImageWithOrientation(targetCtx, currentImage, imageBox, currentOrientation);
  targetCtx.restore();

  targetCtx.fillStyle = textColor.value;
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "top";

  if (titleLine) {
    targetCtx.globalAlpha = 1;
    targetCtx.font = `${titleFontPx}px ${getFontFamily(headlineFontSelect.value)}`;
    targetCtx.fillText(titleLine, outputWidth / 2, titleY, outputWidth * 0.84);
  }

  if (detailLine) {
    targetCtx.globalAlpha = 0.92;
    targetCtx.font = `${detailFontPx}px ${getFontFamily(sublineFontSelect.value)}`;
    targetCtx.fillText(detailLine, outputWidth / 2, detailY, outputWidth * 0.84);
    targetCtx.globalAlpha = 1;
  }

  if (roundedCorners) {
    targetCtx.restore();
  }
}

function renderFrame(targetCanvas, maxLongSide = 2400, options = {}) {
  const targetCtx = targetCanvas.getContext("2d");
  const roundedCorners = Boolean(options.roundedCorners);

  if (!currentImage) {
    targetCanvas.width = 1200;
    targetCanvas.height = 900;
    targetCtx.fillStyle = "#ffffff";
    targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    emptyState.classList.remove("hidden");
    return;
  }

  if (currentTemplate === "galleryDark" || currentTemplate === "galleryDarkPortrait") {
    renderGalleryDarkFrame(targetCanvas, maxLongSide, roundedCorners);
    emptyState.classList.add("hidden");
    return;
  }

  const size = scaledImageSizeForMaxLongSide(maxLongSide);
  const border = Math.round(size.width * getBorderPaddingPercent() / 100);
  const textLayoutHeight = Math.round(size.height * 0.18);
  const bottomExtra = Math.round(size.height * getBottomPaddingPercent() / 100);
  const outputWidth = size.width + border * 2;

  const mainLine = headlineText();
  const subLine = sublineText();
  const exifLine = exifLineText();
  const baseFont = Math.max(22, Math.round(outputWidth * 0.025));
  const headlineScale = Number(headlineSizeRange.value) / 100;
  const sublineScale = Number(sublineSizeRange.value) / 100;
  const infoScale = Number(infoSizeRange.value) / 100;
  const headlineFontPx = Math.round(baseFont * headlineScale);
  const sublineFontPx = Math.round(baseFont * sublineScale);
  const infoFontPx = Math.round(baseFont * infoScale);
  const headlineFontFamily = getFontFamily(headlineFontSelect.value);
  const sublineFontFamily = getFontFamily(sublineFontSelect.value);
  const infoFontFamily = getFontFamily(infoFontSelect.value);
  const captionTop = size.height + border;
  const headlineY = captionTop + textLayoutHeight * (Number(headlineOffsetRange.value) / 100);
  const sublineY = captionTop + textLayoutHeight * (Number(sublineOffsetRange.value) / 100);
  const exifY = captionTop + textLayoutHeight * (Number(infoOffsetRange.value) / 100);
  const textBottom = Math.max(
    headlineY + headlineFontPx * 0.7,
    sublineY + sublineFontPx * 0.7,
    exifLine ? exifY + infoFontPx * 0.7 : captionTop
  );
  const outputHeight = Math.ceil(textBottom + bottomExtra);
  const centerX = outputWidth / 2;

  targetCanvas.width = outputWidth;
  targetCanvas.height = outputHeight;

  if (roundedCorners) {
    targetCtx.save();
    roundedRectPath(targetCtx, 0, 0, outputWidth, outputHeight, getCornerRadiusPx(outputWidth, outputHeight));
    targetCtx.clip();
  }

  targetCtx.fillStyle = paperColor.value;
  targetCtx.fillRect(0, 0, outputWidth, outputHeight);

  drawImageWithOrientation(
    targetCtx,
    currentImage,
    { x: border, y: border, width: size.width, height: size.height },
    currentOrientation
  );

  targetCtx.fillStyle = textColor.value;
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";
  targetCtx.font = `${headlineFontPx}px ${headlineFontFamily}`;
  targetCtx.fillText(mainLine, centerX, headlineY, outputWidth * 0.84);

  targetCtx.font = `${sublineFontPx}px ${sublineFontFamily}`;
  targetCtx.fillText(subLine, centerX, sublineY, outputWidth * 0.84);

  if (exifLine) {
    targetCtx.font = `${infoFontPx}px ${infoFontFamily}`;
    targetCtx.fillText(exifLine, centerX, exifY, outputWidth * 0.84);
  }

  if (roundedCorners) {
    targetCtx.restore();
  }

  emptyState.classList.add("hidden");
}

function previewRenderKey() {
  return [
    currentTemplate,
    borderRange.value,
    bottomRange.value,
    paperColor.value,
    textColor.value,
    headlineInput.value,
    sublineInput.value,
    headlineFontSelect.value,
    sublineFontSelect.value,
    infoFontSelect.value,
    headlineSizeRange.value,
    sublineSizeRange.value,
    infoSizeRange.value,
    headlineOffsetRange.value,
    sublineOffsetRange.value,
    infoOffsetRange.value,
    cornerRadiusRange.value,
    useExifDate.checked ? "date" : "no-date",
    useExifCamera.checked ? "camera" : "no-camera",
    exportRounded.checked ? "rounded" : "square",
  ].join("|");
}

function prunePreviewCache() {
  while (previewCache.size > MAX_PREVIEW_CACHE_ITEMS) {
    let oldestId = null;
    let oldestUsedAt = Number.POSITIVE_INFINITY;
    previewCache.forEach((entry, id) => {
      if (entry.usedAt < oldestUsedAt) {
        oldestUsedAt = entry.usedAt;
        oldestId = id;
      }
    });
    if (oldestId === null) {
      return;
    }
    previewCache.delete(oldestId);
  }
}

function copyCanvas(sourceCanvas, targetCanvas) {
  targetCanvas.width = sourceCanvas.width;
  targetCanvas.height = sourceCanvas.height;
  const targetCtx = targetCanvas.getContext("2d");
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetCtx.drawImage(sourceCanvas, 0, 0);
  emptyState.classList.add("hidden");
}

function cacheCurrentPreview(key) {
  if (!currentPhotoId || !currentImage) {
    return;
  }
  const cachedCanvas = document.createElement("canvas");
  cachedCanvas.width = previewCanvas.width;
  cachedCanvas.height = previewCanvas.height;
  cachedCanvas.getContext("2d").drawImage(previewCanvas, 0, 0);
  previewCache.set(currentPhotoId, {
    key,
    canvas: cachedCanvas,
    usedAt: Date.now(),
  });
  prunePreviewCache();
}

function renderPreview() {
  if (renderPreviewFrame !== null) {
    window.cancelAnimationFrame(renderPreviewFrame);
  }
  renderPreviewFrame = null;
  const key = previewRenderKey();
  const cached = currentPhotoId ? previewCache.get(currentPhotoId) : null;
  if (cached?.key === key) {
    cached.usedAt = Date.now();
    copyCanvas(cached.canvas, previewCanvas);
  } else {
    renderFrame(previewCanvas, PREVIEW_LONG_SIDE);
    cacheCurrentPreview(key);
  }
  updatePreviewCornerRadius();
  applyPreviewViewport();
}

function scheduleRenderPreview() {
  if (renderPreviewFrame !== null) {
    return;
  }
  renderPreviewFrame = window.requestAnimationFrame(renderPreview);
}

function renderPreviewCacheForItem(item, key) {
  const previousState = {
    file: currentFile,
    image: currentImage,
    exif: currentExif,
    orientation: currentOrientation,
    buffer: currentFileBuffer,
  };
  const cachedCanvas = document.createElement("canvas");

  syncCurrentPhotoState(item);
  renderFrame(cachedCanvas, PREVIEW_LONG_SIDE);
  previewCache.set(item.id, {
    key,
    canvas: cachedCanvas,
    usedAt: Date.now() - 1,
  });
  prunePreviewCache();

  currentFile = previousState.file;
  currentImage = previousState.image;
  currentExif = previousState.exif;
  currentOrientation = previousState.orientation;
  currentFileBuffer = previousState.buffer;
}

function schedulePreviewWarmup() {
  if (previewWarmupHandle) {
    return;
  }

  const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(() => callback({ timeRemaining: () => 8 }), 120));

  previewWarmupHandle = schedule((deadline) => {
    previewWarmupHandle = null;
    const key = previewRenderKey();
    const item = photoItems.find((photo) => {
      const cached = previewCache.get(photo.id);
      return photo.id !== currentPhotoId && cached?.key !== key;
    });

    if (!item || deadline.timeRemaining() < 4) {
      if (item) {
        schedulePreviewWarmup();
      }
      return;
    }

    renderPreviewCacheForItem(item, key);
    if (photoItems.some((photo) => photo.id !== currentPhotoId && previewCache.get(photo.id)?.key !== key)) {
      schedulePreviewWarmup();
    }
  });
}

function currentPhotoIndex() {
  return photoItems.findIndex((item) => item.id === currentPhotoId);
}

function syncCurrentPhotoState(item) {
  currentFile = item?.file || null;
  currentImage = item?.image || null;
  currentExif = item?.exif || {};
  currentOrientation = item?.orientation || 1;
  currentFileBuffer = item?.buffer || null;
}

function currentDesignSettings() {
  return {
    template: currentTemplate,
    border: borderRange.value,
    bottom: bottomRange.value,
    paperColor: paperColor.value,
    textColor: textColor.value,
    headline: headlineInput.value,
    subline: sublineInput.value,
    headlineFont: headlineFontSelect.value,
    sublineFont: sublineFontSelect.value,
    infoFont: infoFontSelect.value,
    headlineSize: headlineSizeRange.value,
    sublineSize: sublineSizeRange.value,
    infoSize: infoSizeRange.value,
    headlineOffset: headlineOffsetRange.value,
    sublineOffset: sublineOffsetRange.value,
    infoOffset: infoOffsetRange.value,
    cornerRadius: cornerRadiusRange.value,
    useExifDate: useExifDate.checked,
    useExifCamera: useExifCamera.checked,
    exportRounded: exportRounded.checked,
  };
}

function applyDesignSettings(settings) {
  if (!settings) {
    return;
  }

  const templateName = settings.template || currentTemplate;
  const isYiyinTemplate = templateName === "galleryDark" || templateName === "galleryDarkPortrait";
  currentTemplate = templateName;
  infoControlsRow.classList.toggle("template-hidden", isYiyinTemplate);
  paperColorSection.classList.toggle("template-hidden", isYiyinTemplate);
  templateList.querySelectorAll(".template-card").forEach((button) => {
    button.classList.toggle("active", button.dataset.template === templateName);
  });

  borderRange.value = settings.border ?? borderRange.value;
  bottomRange.value = settings.bottom ?? bottomRange.value;
  paperColor.value = settings.paperColor ?? paperColor.value;
  textColor.value = settings.textColor ?? textColor.value;
  headlineInput.value = settings.headline ?? "";
  sublineInput.value = settings.subline ?? "";
  headlineFontSelect.value = settings.headlineFont ?? headlineFontSelect.value;
  sublineFontSelect.value = settings.sublineFont ?? sublineFontSelect.value;
  infoFontSelect.value = settings.infoFont ?? infoFontSelect.value;
  headlineSizeRange.value = settings.headlineSize ?? headlineSizeRange.value;
  sublineSizeRange.value = settings.sublineSize ?? sublineSizeRange.value;
  infoSizeRange.value = settings.infoSize ?? infoSizeRange.value;
  headlineOffsetRange.value = settings.headlineOffset ?? headlineOffsetRange.value;
  sublineOffsetRange.value = settings.sublineOffset ?? sublineOffsetRange.value;
  infoOffsetRange.value = settings.infoOffset ?? infoOffsetRange.value;
  cornerRadiusRange.value = settings.cornerRadius ?? cornerRadiusRange.value;
  useExifDate.checked = settings.useExifDate ?? useExifDate.checked;
  useExifCamera.checked = settings.useExifCamera ?? useExifCamera.checked;
  exportRounded.checked = settings.exportRounded ?? exportRounded.checked;

  updateLabels();
  updateExportQualityState();
  updateExportButtonLabel();
  updateExportButtonText();
  refreshExportButtonText();
  syncAllRangeFills();
}

function saveCurrentPhotoSettings() {
  if (!currentPhotoId) {
    return;
  }

  const item = photoItems.find((photo) => photo.id === currentPhotoId);
  if (item) {
    item.settings = currentDesignSettings();
  }
}

function applyPhotoSettings(item) {
  if (applyAllPhotos.checked || !item?.settings) {
    return;
  }

  applyDesignSettings(item.settings);
}

function syncAllPhotoSettings() {
  const settings = currentDesignSettings();
  photoItems.forEach((item) => {
    item.settings = { ...settings };
  });
  previewCache.clear();
}

function handleDesignSettingsChange() {
  if (applyAllPhotos.checked) {
    syncAllPhotoSettings();
  } else {
    saveCurrentPhotoSettings();
    if (currentPhotoId) {
      previewCache.delete(currentPhotoId);
    }
  }
}

function updatePhotoList() {
  photoCountLabel.textContent = String(photoItems.length);

  if (photoList.children.length === photoItems.length) {
    photoList.querySelectorAll(".photo-card").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.photoId) === currentPhotoId);
    });
    return;
  }

  photoList.innerHTML = "";

  photoItems.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-card";
    button.classList.toggle("active", item.id === currentPhotoId);
    button.dataset.photoId = String(item.id);

    const thumb = document.createElement("span");
    thumb.className = "photo-thumb";
    const image = document.createElement("img");
    image.src = item.url;
    image.alt = "";
    thumb.appendChild(image);

    const meta = document.createElement("span");
    meta.className = "photo-card-meta";
    const number = document.createElement("strong");
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("span");
    name.textContent = item.file.name;
    meta.appendChild(number);
    meta.appendChild(name);

    button.appendChild(thumb);
    button.appendChild(meta);
    photoList.appendChild(button);
  });
}

function updateImageMetaLabel() {
  const index = currentPhotoIndex();
  if (!currentImage || !currentFile || index < 0) {
    imageMetaLabel.textContent = "未载入照片";
    return;
  }

  const batchText = photoItems.length > 1 ? `${index + 1}/${photoItems.length} · ` : "";
  imageMetaLabel.textContent = `${batchText}${currentFile.name} · ${currentImage.naturalWidth} × ${currentImage.naturalHeight}`;
}

function setCurrentPhoto(id) {
  saveCurrentPhotoSettings();
  const item = photoItems.find((photo) => photo.id === id);
  if (!item) {
    currentPhotoId = null;
    syncCurrentPhotoState(null);
    updatePhotoList();
    updateImageMetaLabel();
    resetPreviewViewport();
    renderPreview();
    return;
  }

  currentPhotoId = item.id;
  syncCurrentPhotoState(item);
  applyPhotoSettings(item);
  updatePhotoList();
  updateImageMetaLabel();
  resetPreviewViewport();
  renderPreview();
}

function clearPhoto() {
  const index = currentPhotoIndex();
  if (index >= 0) {
    const [removed] = photoItems.splice(index, 1);
    if (removed?.url) {
      URL.revokeObjectURL(removed.url);
    }
    previewCache.delete(removed.id);
  }

  imageInput.value = "";
  const nextItem = photoItems[Math.min(index, photoItems.length - 1)] || null;
  setCurrentPhoto(nextItem?.id || null);
}

function showConfirmDialog(message) {
  return new Promise((resolve) => {
    confirmDialogMessage.textContent = message;
    confirmDialog.classList.remove("hidden");

    const close = (result) => {
      confirmDialog.classList.add("hidden");
      confirmOkButton.removeEventListener("click", handleOk);
      confirmCancelButton.removeEventListener("click", handleCancel);
      confirmDialog.removeEventListener("click", handleBackdrop);
      document.removeEventListener("keydown", handleKeydown);
      resolve(result);
    };

    const handleOk = () => close(true);
    const handleCancel = () => close(false);
    const handleBackdrop = (event) => {
      if (event.target === confirmDialog) {
        close(false);
      }
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        close(false);
      }
    };

    confirmOkButton.addEventListener("click", handleOk);
    confirmCancelButton.addEventListener("click", handleCancel);
    confirmDialog.addEventListener("click", handleBackdrop);
    document.addEventListener("keydown", handleKeydown);
    confirmOkButton.focus();
  });
}

async function clearAllPhotos() {
  if (!photoItems.length) {
    return;
  }

  const confirmed = await showConfirmDialog("确定要删除已导入的全部照片吗？");
  if (!confirmed) {
    return;
  }

  photoItems.forEach((item) => {
    if (item.url) {
      URL.revokeObjectURL(item.url);
    }
  });
  photoItems = [];
  currentPhotoId = null;
  previewCache.clear();
  imageInput.value = "";
  syncCurrentPhotoState(null);
  updatePhotoList();
  updateImageMetaLabel();
  resetPreviewViewport();
  renderPreview();
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function fileToImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function loadPhoto(file, options = {}) {
  const shouldActivate = options.activate !== false;
  const objectUrl = URL.createObjectURL(file);

  try {
    const [buffer, image] = await Promise.all([
      fileToArrayBuffer(file),
      fileToImage(objectUrl),
    ]);

    const exif = parseExif(buffer);
    const item = {
      id: nextPhotoId,
      file,
      image,
      url: objectUrl,
      exif,
      orientation: Number(exif.orientation || 1),
      buffer,
      settings: currentDesignSettings(),
    };
    nextPhotoId += 1;
    photoItems.push(item);
    if (shouldActivate) {
      setCurrentPhoto(item.id);
    } else if (options.updateList !== false) {
      updatePhotoList();
    }
    return item;
  } catch {
    URL.revokeObjectURL(objectUrl);
    syncCurrentPhotoState(null);
    resetPreviewViewport();
    imageMetaLabel.textContent = "载入失败";
    renderPreview();
  }
}

async function handleFiles(fileList) {
  const files = Array.from(fileList).filter((item) => item.type.startsWith("image/"));
  if (!files.length) {
    return;
  }

  const addedItems = [];
  for (const file of files) {
    const item = await loadPhoto(file, { activate: false, updateList: false });
    if (item) {
      addedItems.push(item);
    }
  }

  const lastItem = addedItems[addedItems.length - 1];
  if (lastItem) {
    setCurrentPhoto(lastItem.id);
  } else {
    updatePhotoList();
  }
}

function desktopPhotoToFile(photo) {
  if (!photo || photo.canceled || !Array.isArray(photo.data)) {
    return null;
  }
  return new File(
    [new Uint8Array(photo.data)],
    photo.name || "photo",
    { type: photo.mimeType || "application/octet-stream" }
  );
}

function desktopPhotosToFiles(result) {
  if (!result || result.canceled || !Array.isArray(result.files)) {
    const file = desktopPhotoToFile(result);
    return file ? [file] : [];
  }
  return result.files.map(desktopPhotoToFile).filter(Boolean);
}

async function openPhotoPicker() {
  if (window.borderLabDesktop?.openPhoto) {
    try {
      const result = await window.borderLabDesktop.openPhoto();
      const files = desktopPhotosToFiles(result);
      await handleFiles(files);
      return;
    } catch (error) {
      console.error("Failed to open desktop photo picker.", error);
    }
  }

  if ("showOpenFilePicker" in window) {
    try {
      const handles = await window.showOpenFilePicker({
        id: "border-lab-import-photo",
        multiple: true,
        types: [
          {
            description: "Images",
            accept: {
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
              "image/webp": [".webp"],
            },
          },
        ],
      });
      await handleFiles(await Promise.all(handles.map((handle) => handle.getFile())));
      return;
    } catch (error) {
      if (error && error.name === "AbortError") {
        return;
      }
      console.error("Failed to open browser photo picker.", error);
    }
  }

  imageInput.click();
}

function exportFileNameFor(file, usedNames) {
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const shouldExportRounded = exportRounded.checked;
  const extension = shouldExportRounded ? "png" : "jpg";
  let fileName = `${baseName}.${extension}`;
  let counter = 2;

  while (usedNames?.has(fileName.toLowerCase())) {
    fileName = `${baseName}-${counter}.${extension}`;
    counter += 1;
  }

  usedNames?.add(fileName.toLowerCase());
  return fileName;
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

async function createExportBlob() {
  if (!currentImage || !currentFile) {
    return null;
  }

  const shouldExportRounded = exportRounded.checked;
  const quality = Number(exportQualityRange.value) / 100;
  const exportMaxLongSide = exportSizeSelect.value === "original"
    ? Number.POSITIVE_INFINITY
    : Number(exportSizeSelect.value);
  const exportCanvas = document.createElement("canvas");
  renderFrame(exportCanvas, exportMaxLongSide, { roundedCorners: shouldExportRounded });
  const blob = await canvasToBlob(
    exportCanvas,
    shouldExportRounded ? "image/png" : "image/jpeg",
    shouldExportRounded ? undefined : quality
  );

  if (!blob) {
    return null;
  }

  if (!shouldExportRounded && currentFile?.type === "image/jpeg" && currentFileBuffer) {
    return mergeExifIntoJpegBlob(blob, currentFileBuffer);
  }

  return blob;
}

async function saveBlobWithPicker(blob, fileName, mimeType) {
  try {
    if (window.borderLabDesktop?.saveFile) {
      const buffer = await blob.arrayBuffer();
      const result = await window.borderLabDesktop.saveFile({
        suggestedName: fileName,
        mimeType,
        buffer
      });
      return true;
    }

    if ("showSaveFilePicker" in window) {
      const handle = await window.showSaveFilePicker({
        id: "border-lab-export-image",
        suggestedName: fileName,
        types: [
          {
            description: mimeType === "image/png" ? "PNG Image" : "JPEG Image",
            accept: {
              [mimeType]: mimeType === "image/png" ? [".png"] : [".jpg", ".jpeg"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    }
  } catch (error) {
    if (error && error.name === "AbortError") {
      return true;
    }
  }

  return false;
}

function downloadBlob(blob, fileName) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportImage() {
  if (!currentImage || !currentFile) {
    return;
  }

  const shouldExportRounded = exportRounded.checked;
  const fileName = exportFileNameFor(currentFile);
  const finalBlob = await createExportBlob();
  if (!finalBlob) {
    return;
  }

  const saved = await saveBlobWithPicker(
    finalBlob,
    fileName,
    shouldExportRounded ? "image/png" : "image/jpeg"
  );
  if (!saved) {
    downloadBlob(finalBlob, fileName);
  }
}

async function createExportRecord(item, usedNames) {
  if (!applyAllPhotos.checked && item?.settings) {
    applyDesignSettings(item.settings);
  }
  syncCurrentPhotoState(item);
  const blob = await createExportBlob();
  if (!blob) {
    return null;
  }

  return {
    name: exportFileNameFor(item.file, usedNames),
    mimeType: exportRounded.checked ? "image/png" : "image/jpeg",
    blob,
  };
}

async function exportAllImages() {
  if (!photoItems.length) {
    return;
  }

  const originalId = currentPhotoId;
  const originalSettings = currentDesignSettings();
  const usedNames = new Set();
  const records = [];

  exportAllButton.disabled = true;
  exportAllButton.textContent = "导出中...";

  try {
    for (const item of photoItems) {
      const record = await createExportRecord(item, usedNames);
      if (record) {
        records.push(record);
      }
    }

    if (window.borderLabDesktop?.saveFiles) {
      const files = [];
      for (const record of records) {
        files.push({
          name: record.name,
          mimeType: record.mimeType,
          buffer: await record.blob.arrayBuffer(),
        });
      }
      const result = await window.borderLabDesktop.saveFiles({ files });
      return;
    }

    if ("showDirectoryPicker" in window) {
      try {
        const directory = await window.showDirectoryPicker({ id: "border-lab-export-batch" });
        for (const record of records) {
          const handle = await directory.getFileHandle(record.name, { create: true });
          const writable = await handle.createWritable();
          await writable.write(record.blob);
          await writable.close();
        }
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }
    }

    records.forEach((record) => downloadBlob(record.blob, record.name));
  } finally {
    applyDesignSettings(originalSettings);
    const originalItem = photoItems.find((item) => item.id === originalId);
    currentPhotoId = originalId;
    syncCurrentPhotoState(originalItem);
    updatePhotoList();
    updateImageMetaLabel();
    resetPreviewViewport();
    renderPreview();
    exportAllButton.disabled = false;
    refreshExportButtonText();
  }
}

[
  borderRange,
  bottomRange,
  paperColor,
  textColor,
  headlineInput,
  sublineInput,
  headlineFontSelect,
  sublineFontSelect,
  infoFontSelect,
  headlineSizeRange,
  sublineSizeRange,
  infoSizeRange,
  headlineOffsetRange,
  sublineOffsetRange,
  infoOffsetRange,
  cornerRadiusRange,
  useExifDate,
  useExifCamera,
  applyAllPhotos,
].forEach((element) => {
  element.addEventListener("input", () => {
    handleDesignSettingsChange();
    updateLabels();
    syncRangeFill(element);
    scheduleRenderPreview();
  });
  element.addEventListener("change", () => {
    handleDesignSettingsChange();
    updateLabels();
    syncRangeFill(element);
    scheduleRenderPreview();
  });
});

imageInput.addEventListener("change", (event) => handleFiles(event.target.files));
uploadButton.addEventListener("click", openPhotoPicker);
emptyState.addEventListener("click", (event) => {
  event.stopPropagation();
  openPhotoPicker();
});
canvasFrame.addEventListener("click", () => {
  if (!currentImage) {
    openPhotoPicker();
  }
});
canvasFrame.addEventListener("wheel", (event) => {
  if (!currentImage) {
    return;
  }
  event.preventDefault();

  const delta = event.deltaY < 0 ? 1.12 : 1 / 1.12;
  const nextScale = Math.min(4, Math.max(1, previewScale * delta));
  if (Math.abs(nextScale - previewScale) < 0.001) {
    return;
  }

  previewScale = nextScale;
  if (previewScale === 1) {
    previewOffsetX = 0;
    previewOffsetY = 0;
  }
  applyPreviewViewport();
}, { passive: false });
canvasFrame.addEventListener("pointerdown", (event) => {
  if (!currentImage || previewScale <= 1) {
    return;
  }
  previewPointerId = event.pointerId;
  previewDragStartX = event.clientX;
  previewDragStartY = event.clientY;
  previewDragOriginX = previewOffsetX;
  previewDragOriginY = previewOffsetY;
  canvasFrame.classList.add("is-panning");
  canvasFrame.setPointerCapture(event.pointerId);
});
canvasFrame.addEventListener("pointermove", (event) => {
  if (previewPointerId !== event.pointerId) {
    return;
  }
  previewOffsetX = previewDragOriginX + (event.clientX - previewDragStartX);
  previewOffsetY = previewDragOriginY + (event.clientY - previewDragStartY);
  applyPreviewViewport();
});
function endPreviewPan(event) {
  if (previewPointerId !== event.pointerId) {
    return;
  }
  previewPointerId = null;
  canvasFrame.classList.remove("is-panning");
  if (canvasFrame.hasPointerCapture(event.pointerId)) {
    canvasFrame.releasePointerCapture(event.pointerId);
  }
}
canvasFrame.addEventListener("pointerup", endPreviewPan);
canvasFrame.addEventListener("pointercancel", endPreviewPan);
exportQualityRange.addEventListener("input", updateLabels);
exportQualityRange.addEventListener("input", () => {
  syncRangeFill(exportQualityRange);
});
exportQualityRange.addEventListener("change", () => {
  syncRangeFill(exportQualityRange);
});
exportRounded.addEventListener("change", () => {
  updateExportButtonLabel();
  updateExportButtonText();
  refreshExportButtonText();
  updatePreviewCornerRadius();
  updateExportQualityState();
});
applyAllPhotos.addEventListener("change", () => {
  if (applyAllPhotos.checked) {
    syncAllPhotoSettings();
  } else {
    saveCurrentPhotoSettings();
  }
  scheduleRenderPreview();
});
clearAllPhotosButton.addEventListener("click", clearAllPhotos);
clearPhotoButton.addEventListener("click", clearPhoto);
exportButton.addEventListener("click", exportImage);
exportAllButton.addEventListener("click", exportAllImages);
photoList.addEventListener("click", (event) => {
  const button = event.target.closest(".photo-card");
  if (!button) {
    return;
  }
  setCurrentPhoto(Number(button.dataset.photoId));
});
templateList.addEventListener("click", (event) => {
  const button = event.target.closest(".template-card");
  if (!button) {
    return;
  }
  applyTemplate(button.dataset.template);
  handleDesignSettingsChange();
  resetPreviewViewport();
  updateLabels();
  syncAllRangeFills();
  scheduleRenderPreview();
});

resetButton.addEventListener("click", () => {
  resetControls();
  resetPreviewViewport();
  scheduleRenderPreview();
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    canvasStage.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    canvasStage.classList.remove("drag-over");
  });
});

dropZone.addEventListener("drop", (event) => {
  if (event.dataTransfer?.files?.length) {
    handleFiles(event.dataTransfer.files);
  }
});

resetControls();
[
  headlineFontSelect,
  sublineFontSelect,
  infoFontSelect,
  exportSizeSelect,
].forEach(enhanceSelect);
updateLabels();
updateExportQualityState();
updateExportButtonLabel();
updateExportButtonText();
refreshExportButtonText();
updatePreviewCornerRadius();
syncAllRangeFills();
renderPreview();
window.addEventListener("resize", applyPreviewViewport);
