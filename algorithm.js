/**
 * Point
 *  first element - x
 *  second element - y
 */
function doJob(data) {
	var result = [],
		point = data.point,
		array = data.array,
		needValue = getValue(point[0], point[1]);

	check_point(point);

	if (
		typeof window === 'object' &&
		window !== null
	) {
		return result;
	}
	postMessage(result);

	function check_point(point) {
		var currentValue = getValue(point[0], point[1]);
		if (typeof currentValue !== 'number') {
			return;
		}

		if (currentValue !== needValue) {
			return;
		}

		var already_in_results = result.some(function checkPoint(p) {
			return (p[0] === point[0] && p[1] === point[1]);
		});
		if (already_in_results) {
			return;
		}

		result.push([point[0], point[1]]);
		check_point([point[0] - 1, point[1]]);
		check_point([point[0],     point[1] + 1]);
		check_point([point[0] + 1, point[1]]);
		check_point([point[0],     point[1] - 1]);
	}

	function getValue(x, y) {
		var row = array[x];
		if (!Array.isArray(row)) {
			return undefined;
		}
		return row[y];
	}
}

self.addEventListener('message', function(e) {
  doJob(e.data);
}, false);
