// #todo move to application config
export const encodingConfig = {
	"videoMaxWidth": 350,
	"videoMaxDuration": 1800,
	"sourceBucket": "newshub-video-in",
	"destinationBucket": "newshub-video-out",
	"gzip": false,
	"format": {
		"image": {
			"extension": "png",
			"mimeType": "image/png"
		},
		"video": {
			"extension": "mp4",
			"mimeType": "video/mp4"
		}
	}
}