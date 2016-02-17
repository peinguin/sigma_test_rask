
function doJob(data) {
	var result = [[1, 1], [1, 2]],
		point = data.point,
		array = data.array;

	if (
		typeof window === 'object' &&
		window !== null
	) {
		return result;
	}
	postMessage(result);
}

self.addEventListener('message', function(e) {
  doJob(e.data);
}, false);
