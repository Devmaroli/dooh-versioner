---
name: DOOH 3D-tracked billboard mockup
description: >-
  Use this when making an After Effects mockup that places a DOOH ad onto a real
  billboard or LED screen in moving footage, using 3D Camera Tracker, corner
  pinning, and an LED-screen look.
---
# DOOH 3D-tracked billboard mockup (After Effects)

This workflow was learned from the user's own screen recording and written notes. Values are starting points; adjust them by eye.

## Inputs
- Billboard footage with camera movement
- The ad artwork or video to place on the screen
- Plugins: Sapphire (S_ScanLinesMono), CC Vignette, Mosaic, Exposure, Noise

## Steps
1. **Comp.** Import the billboard footage and make a comp from it, about 10 s long. Use the footage's own size and fps.
2. **Track.** Apply **3D Camera Tracker** to the footage and let it analyse and solve. Set Shot Type to **Fixed Angle of View** and leave the track point and target sizes at their defaults.
3. **Plane.** Select a group of track points on the flat billboard face until the target sits flat on it. Right-click and choose **Create Solid and Camera**.
4. **Swap in the ad.** Import the ad. Its aspect ratio should cover roughly 90–98% of the screen. Hold **Alt** and drag it onto the Track Solid to replace the solid.
5. **Fit.** Adjust Scale, then use **Corner Pin** to place the ad's corners inside the bezel. Scrub the timeline to check the track holds.
6. **Colour match.** On the ad, toggle each effect on and off to compare it against the real screen.
   - **Exposure:** Lower the exposure to roughly match the real screen's brightness, or raise it slightly if the ad looks too dark. Lift the blacks so they read like a daylight LED screen.
   - **CC Vignette:** Set Center to the middle of the screen and keep the vignette subtle.
   - **Mosaic:** Start at 360 × 360 blocks. Raise the value if the artwork looks too pixelated, since 360 is only approximate.
7. **LED scanlines.** Duplicate the ad layer and place the copy above the original. Apply **S_ScanLinesMono** and set the blend mode to **Screen**. Rotate the line angle until the lines are horizontal. Keep the effect light by lowering opacity or reducing sharpness in its settings.
8. **Grain.** Add an adjustment layer at the top with **Noise**. Turn off Use Color Noise and set the amount to 4–7%.
9. **Foreground occluders (optional, from recording).** If something like a lamp post sits in front of the screen, duplicate the original footage above the ad and Pen-mask the object. Keyframe the Mask Path so it follows the object.
10. **Review.** Scrub the full timeline and check the track, edges, and brightness. Don't start a render without the user's go-ahead.
