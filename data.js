/* =====================================================================
   data.js — THE ONLY FILE YOU NEED TO EDIT TO ADD PROJECTS
   ---------------------------------------------------------------------
   To add something: copy one { ... } block, paste it at the TOP of the
   list (newest first), change the text, save. That's it.

   IMAGES
   - Put the photo anywhere in the images/ folder and write its path,
     e.g. image: "images/crafts/bee-amigurumi.jpg"
   - Any size or shape works. It is cropped to fit the tile, never
     stretched. Clicking a craft photo opens the full uncropped version.
   - Leave image: "" to show a placeholder box.
   - If the crop cuts off the important part, add
     focus: "top"   (or "bottom", "left", "right", "30% 70%" ...)
   ===================================================================== */

/* ---------- WORKING HOURS: projects on index.html ----------
   title  : card heading
   link   : where the heading goes ("" for no link)
   blurb  : one or two sentences
   tags   : little labels
   image  : optional thumbnail ("" = no image, the card is just text)
   extra  : optional second link, e.g. a publication                    */
const WORK_PROJECTS = [
  {
    title: "Fabricated brain phantom",
    link: "https://drive.google.com/file/d/1oObNJOzo3ZSQfBvVYp2CDYL-N9yR0d_E/view?usp=sharing",
    blurb: "Models temporal interference; pre-publication manuscript written, working towards publication.",
    tags: ["neural interfaces", "BCIs", "COMSOL"],
    image: "",
  },
  {
    title: "iGEM 2025 @ GEMS Taiwan",
    link: "https://2025.igem.wiki/gems-taiwan/",
    blurb: "Textile-degrading enzymes, targeting the global waste problem.",
    tags: ["bioinformatics", "machine learning", "wiki"],
    image: "",
    extra: { label: "Publication: DOI 10.3389/fsysb.2026.1914536", url: "https://doi.org/10.3389/fsysb.2026.1914536" },
  },
  {
    title: "iGEM 2024 @ UCSC",
    link: "https://2024.igem.wiki/ucsc/home",
    blurb: "DHA from seaweed, improving healthcare accessibility.",
    tags: ["synthetic biology", "wiki lead", "team editor"],
    image: "",
  },
  {
    title: "Biomaterials presentation",
    link: "https://drive.google.com/file/d/1cCCBAMvYH3qTa38HvvPystRBptXPM793/view?usp=sharing",
    blurb: "Neuroreparative brain patch for regeneration after traumatic brain injury (symposium-style poster).",
    tags: ["biomaterials", "poster"],
    image: "",
  },
  {
    title: "Tissue regeneration poster",
    link: "https://drive.google.com/file/d/1fHxNMU_yhmx_PR73va771denP9G02Zbn/view?usp=sharing",
    blurb: "Alveolar regeneration and integration techniques (symposium-style poster).",
    tags: ["tissue engineering", "poster"],
    image: "",
  },
  {
    title: "Biomimetics brochure",
    link: "https://drive.google.com/file/d/19x2AgefGgnU2rGU5tV-9Z_4seEmFVf4-/view?usp=sharing",
    blurb: "How the bee waggle dance inspires technology (printable brochure).",
    tags: ["biomimetics", "science writing"],
    image: "",
  },
  {
    title: "Medical device coursework",
    link: "https://drive.google.com/file/d/1-V8itlwGt1YJjdF5t0oNTNPIC-G_yrzo/view?usp=sharing",
    blurb: "",
    tags: ["medical regulation"],
    image: "",
  },
  {
    title: "Data visualisation portfolio",
    link: "https://drive.google.com/drive/folders/1pCjiveqkgBgXCwdiahEYS6m4gZLlfXS0?usp=drive_link",
    blurb: "",
    tags: ["python", "matplotlib"],
    image: "",
  },
];

/* ---------- AFTER HOURS: craft tracker on quest.html ----------
   title    : name of the make
   category : "crochet", "embroidery", or anything else you like.
              New categories get their own filter button automatically.
   status   : "finished", "in progress", or "planned"
   image    : path to the photo ("" = placeholder)
   full     : optional. If the tile photo is a cropped copy, put the
              original here and it opens when the tile is clicked.
   note     : optional short line (yarn, pattern, who it was for ...)
   shape    : "square" (default), "tall", or "wide" — the tile's shape
   focus    : optional, which part of the photo to keep when cropping   */
const CRAFT_PROJECTS = [
  { title: "Pink daisy wreath", category: "embroidery", status: "finished", image: "images/crafts/thumbs/embroidery-01.jpg", full: "images/crafts/embroidery-01.jpg", note: "Embroidery on a backpack", shape: "square" },
  { title: "Sage green set", category: "nail art", status: "finished", image: "images/crafts/thumbs/nails-01.jpg", full: "images/crafts/nails-01.jpg", note: "Nail art", shape: "square" },
  { title: "Ruffle-edge scarf", category: "crochet", status: "finished", image: "images/crafts/thumbs/crochet-01.jpg", full: "images/crafts/crochet-01.jpg", note: "Crochet scarf, also worn as a top", shape: "tall" },
  { title: "Cartoon high-top", category: "embroidery", status: "finished", image: "images/crafts/thumbs/embroidery-02.jpg", full: "images/crafts/embroidery-02.jpg", note: "Hand-embroidered canvas sneaker", shape: "square" },
  { title: "White swirls", category: "nail art", status: "finished", image: "images/crafts/thumbs/nails-02.jpg", full: "images/crafts/nails-02.jpg", note: "Nail art", shape: "square" },
  { title: "Balloon dog", category: "crochet", status: "finished", image: "images/crafts/thumbs/crochet-04.jpg", full: "images/crafts/crochet-04.jpg", note: "Crochet amigurumi", shape: "square" },
  { title: "Outline French tips", category: "nail art", status: "finished", image: "images/crafts/thumbs/nails-03.jpg", full: "images/crafts/nails-03.jpg", note: "Nail art", shape: "square" },
  { title: "Lilac and rose wreath", category: "embroidery", status: "finished", image: "images/crafts/thumbs/embroidery-03.jpg", full: "images/crafts/embroidery-03.jpg", note: "Embroidery on a backpack", shape: "square" },
  { title: "Rose bouquet", category: "crochet", status: "finished", image: "images/crafts/thumbs/crochet-02.jpg", full: "images/crafts/crochet-02.jpg", note: "Crochet bouquet that is also a blanket", shape: "square" },
  { title: "Checks and daisies", category: "nail art", status: "finished", image: "images/crafts/thumbs/nails-04.jpg", full: "images/crafts/nails-04.jpg", note: "Nail art", shape: "square" },
  { title: "Roses and daisies", category: "embroidery", status: "finished", image: "images/crafts/thumbs/embroidery-04.jpg", full: "images/crafts/embroidery-04.jpg", note: "Embroidery on a backpack", shape: "square" },
  { title: "Stars and chrome", category: "press on nails", status: "finished", image: "images/crafts/thumbs/nails-05.jpg", full: "images/crafts/nails-05.jpg", note: "Nail art", shape: "square" },
  { title: "Mesh top", category: "crochet", status: "finished", image: "images/crafts/thumbs/crochet-03.jpg", full: "images/crafts/crochet-03.jpg", note: "Crochet top", shape: "tall" },
  { title: "Heart French tips", category: "nail art", status: "finished", image: "images/crafts/thumbs/nails-06.jpg", full: "images/crafts/nails-06.jpg", note: "Nail art", shape: "square" },
  { title: "Mushroom lighter holder", category: "crochet", status: "finished", image: "images/crafts/thumbs/crochet-05.jpg", full: "images/crafts/crochet-05.jpg", note: "Crochet lighter holder", shape: "square" },
  { title: "Pink shimmer with flowers", category: "nail art", status: "finished", image: "images/crafts/thumbs/nails-07.jpg", full: "images/crafts/nails-07.jpg", note: "Nail art", shape: "square" },
];

/* ---------- AFTER HOURS: conference / collaboration notes ----------
   link is optional: point it at a write-up when you have one.         */
const FIELD_NOTES = [
  { title: "Slush 2026", where: "Helsinki", text: "Notes coming soon.", link: "" },
  { title: "iGEM 2024", where: "Paris", text: "Notes coming soon.", link: "" },
  { title: "BABS 2024", where: "UC Berkeley", text: "Notes coming soon.", link: "" },
  { title: "OpenBio 2023", where: "Harvard", text: "Notes coming soon.", link: "" },
];
