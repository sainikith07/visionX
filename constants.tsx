import React from 'react';

export const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Document', path: '/docs' },
  { name: 'Home Staging', path: '/staging' },
  { name: 'Video AI', path: '/video' },
  { name: 'About', path: '/about' },
];

export const APP_NAME = "VISION-X";
export const APP_SUBTITLE = "Enhance your images with just a few clicks.";

export const DEVELOPER_INFO = {
  name: "Sai Nikith",
  college: "ACE Engineering College",
  email: "sainikith04@gmail.com",
  linkedin: "https://www.linkedin.com/in/sai-nikith-kaleru/",
  github: "https://github.com/sainikith07",
  phone: "9573311069"
};

export const PRO_FEATURES = [
  { title: "No Watermarks", desc: "Clean, professional exports for commercial use.", icon: "fa-eye-slash" },
  { title: "4K AI Upscaling", desc: "Enhance images to ultra-high definition automatically.", icon: "fa-up-right-and-down-left-from-center" },
  { title: "Priority Processing", desc: "Skip the queue with dedicated VLM inference slots.", icon: "fa-bolt" },
  { title: "Batch Mode", desc: "Process entire folders of documents in one click.", icon: "fa-layer-group" },
  { title: "Adaptive Cloak Pro", desc: "Multi-object tracking for video background privacy.", icon: "fa-mask" },
  { title: "Cloud Sync", desc: "Access your projects from any device with secure cloud storage.", icon: "fa-cloud" },
  { title: "API Access", desc: "Integrate VISION-X directly into your own workflow.", icon: "fa-code" },
];

export const USAGE_STEPS = [
  { step: "01", title: "Upload", desc: "Select a scanned or photographed document" },
  { step: "02", title: "Analyze", desc: "AI detects shadows, fingers, and noise" },
  { step: "03", title: "Enhance", desc: "Cleaning visual disturbances" },
  { step: "04", title: "Result", desc: "Preview and download output" }
];