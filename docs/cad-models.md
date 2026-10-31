# Adding 3D CAD Models to a Project Page

Project pages (both `project-main` and `project-detail` layouts) can show interactive 3D models that visitors can rotate, zoom and pan. The viewer is Google's [`<model-viewer>`](https://modelviewer.dev/) web component, loaded from a CDN only on pages that actually have models.

The viewer lives in `_includes/cad-viewer.html`. You normally don't need to touch it. Just add files and front matter.

## Quick start

1. Export your model as **`.glb`** (binary glTF). See [Exporting from CAD](#exporting-from-cad) below.
2. Compress it (see [Shrinking the file](#shrinking-the-file)). Aim for **under 5 MB**, and keep it under 10 MB at most.
3. Put it in `assets/models/<project-folder>/`, e.g. `assets/models/6dof_arm/arm-assembly.glb`.
4. Add a `cad_models` list to the project's front matter:

```yaml
cad_models:
  - src: /assets/models/6dof_arm/arm-assembly.glb
    title: Full arm assembly
    caption: Exported from Onshape, rev C.
```

5. Run `bundle exec jekyll serve` and open the project page. A **3D Models** section appears below the Goals / Ideas / Objective / Future blocks (or below the description on sub-project pages).

You can list several models; each one gets its own viewer, stacked vertically.

## Front matter fields

| Field          | Required | Default | What it does |
|----------------|----------|---------|--------------|
| `src`          | yes      | —       | Path to the `.glb` / `.gltf` file, starting with `/assets/...` |
| `title`        | yes      | —       | Bold caption under the viewer; also used as the accessible alt text |
| `caption`      | no       | —       | Smaller line of text under the title |
| `poster`       | no       | —       | Image shown before the model loads (a screenshot of the model works well) |
| `camera_orbit` | no       | auto    | Starting camera angle: `"<turn>deg <tilt>deg <distance>"`, e.g. `"45deg 70deg auto"` |
| `auto_rotate`  | no       | `true`  | Set to `false` to stop the slow spin |

**Tip for `camera_orbit`:** open the page, rotate the model to the angle you like, then run this in the browser console:
`document.querySelector('model-viewer').getCameraOrbit().toString()`, and paste the result in (rounded is fine).

## Exporting from CAD

| Tool | How |
|------|-----|
| **Onshape** | Right-click the Part Studio or Assembly tab → **Export** → Format **GLTF**, and tick "Download as binary (GLB)" if offered. Otherwise export `.gltf` and convert it with the Blender route below. |
| **SolidWorks** | **File → Save As → STL** (or export via **3D Interconnect / Visualize** to glTF if your version has it). Convert STL → GLB in Blender. |
| **Fusion 360** | **File → Export → OBJ or STL** (newer versions also offer glTF/GLB with the right extension). Convert in Blender if needed. |
| **Blender** (converter) | **File → Import** your STL/OBJ/glTF, give parts materials or colours if you want, then **File → Export → glTF 2.0** with *Format: glTF Binary (.glb)*. Check *Apply Modifiers* and, under *Data → Mesh*, optionally *Compression* (Draco). |

Before exporting, **hide fasteners, threads and internal parts** nobody will see. They balloon file size without adding much.

## Shrinking the file

CAD exports are often 20–100 MB. The site is static and the model downloads on every visit, so compress it. The easiest tool is [glTF-Transform](https://gltf-transform.dev/) (needs Node.js):

```bash
npx @gltf-transform/cli optimize input.glb output.glb --compress meshopt --simplify-ratio 0.5
```

- `--compress meshopt` (or `draco`) shrinks the geometry a lot. `<model-viewer>` decodes both automatically.
- `--simplify-ratio 0.5` keeps about half the triangles. Lower it if the file is still big; go back up if curved surfaces start looking faceted.
- No Node? Drag the file into <https://gltf.report/>, run the *Optimize* script, and download the result.

Check the result by dragging it into <https://modelviewer.dev/editor/>.

## Notes

- Posters can be `.png`/`.jpg`. Like every other image, the deploy script converts them to `.webp` and rewrites the reference automatically.
- GitHub warns at 50 MB per file and blocks at 100 MB. Compressed models should be nowhere near that.
- The placeholder at `assets/models/placeholder/robot-arm-placeholder.glb` is a stand-in made from simple shapes. Delete it once real models are in.
