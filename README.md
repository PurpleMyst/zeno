# zeno

A fork of [mercator](https://github.com/FlyOrBoom/mercator) that removes what I didn't I use and adds a more realistic alternative to freezing called "playback" which lets you record and play back a couple of seconds of video.

## Usage

Create a new bookmark, title it anything you want and set the URL to the contents of dist/bookmarklet.js prepended by `javascript:`.

Then, while in a Google Meet call (or anything that utilizes your videocamera, for that matter), open the bookmarklet to make Zeno Studio pop up.

Any time the webpage requests access to your camera _after_ the bookmarklet is loaded, it will show up in the Zeno Studio. You can then control its settings, including enabling playback, which will start recording immediately as soon as you check the checkbox. If the outline around the stream preview is green, this means that its live from the stream source, if it's yellow it's currently recording, and finally if it's red it's currently playing back pre-recorded video.

Zeno Studio supports multiple different streams being utilized by the webpage at once. However, effects by default are only enabled on the first stream opened. To enable or disable effects on a stream, enable or disable the corresponding checkbox next to the preview in Zeno Studio.
