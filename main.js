var INIT_SIZE_X = 1,
	INIT_SIZE_Y = 1,
	MAX_RANDOM_INT = 9,
	MIN_RANDOM_INT = 1,
	MAX_FILE_SIZE = 1024,
	ALGORITHM_FILE_NAME = 'algorithm.js';

function loadScript(url) {
	var body = document.body,
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;

	body.appendChild(script);
}

function getNodeIndex(node) {
	var i = 0;
	while( (node = node.previousSibling) !== null ) {
		i++;
	}

	return i;
}

function Communicator() {
	var worker,
		callback;

	this.trigger = trigger;

	if(typeof(Worker) !== "undefined") {
		try {
			worker = new Worker(ALGORITHM_FILE_NAME);
		}
		catch(e) {}
	}
	if (worker) {
		worker.addEventListener('message', function(e) {
			if (typeof callback === 'function') {
				callback(e.data);
			}
		}, false);
	} else {
		loadScript(ALGORITHM_FILE_NAME);
	}

	function trigger(point, array, cb) {
		callback = cb;

		var message = {
			point: point,
			array: array
		};

		if (worker) {
			worker.postMessage(message);
		}
		else {
			var data = doJob(message);
			if (typeof cb === 'function') {
				cb(data);
			}
		}
	}
}

function MyFileReader(setData) {
	'use strict';

	if (window.File && window.FileReader) {
		document.getElementById('file').addEventListener('change', handleFileSelect, false);
		window.addEventListener('dragover', handleDragOver, false);
		window.addEventListener('dragleave', handleDragLeave, false);
		window.addEventListener('drop', handleFileSelect, false);
	} else {
		var dndElement = document.getElementById('dndlabel');
		dndElement.parentNode.removeChild(dndElement);
	}

	function processFile(e) {
		var data = [],
			rows = e.target.result.split(/[\r\n]+/),
			maxColsCount = 0;

		data = rows.reduce(function processRow(rows, row) {
			var cols = row.split(';').reduce(function(cols, value) {
				var parsed = parseInt(value, 10);
				if (isNaN(parsed) || parsed != value) {
					return cols;
				}
				cols.push(value);
				return cols;
			}, []);

			if (cols.length > 0) {

				if (cols.length > maxColsCount) {
					maxColsCount = cols.length;
				}

				rows.push(cols);
			}
			return rows;
		}, []);

		data.forEach(function(row) {
			while (row.length < maxColsCount) {
				row.push('0');
			}
		});

		setData(data);    
	}

	function handleFileSelect(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		document.getElementById('dragover').style.display = 'none';

		var files = (evt.dataTransfer || evt.target).files;

		if (files.length !== 1) {
			alert('Use single file');
			return;
		}
		if (files[0].size > MAX_FILE_SIZE) {
			alert('Max file size is ' + MAX_FILE_SIZE);
			return;
		}

		var reader = new window.FileReader();

		reader.onload = processFile;
		reader.readAsText(files[0]);
	}

	function handleDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';

		document.getElementById('dragover').style.display = 'block';
	}

	function handleDragLeave() {
		document.getElementById('dragover').style.display = 'none';
	}
}

function TableController(calculate) {
	'use strict';

	this.getColsCount = getColsCount;
	this.getRowsCount = getRowsCount;
	this.setCols = setCols;
	this.setRows = setRows;
	this.setData = setData;

	var rows = document.getElementById('rows'),
		cols = document.getElementById('cols'),
		rnd = document.getElementById('rnd'),
		table = document.getElementById('table');

	rows.addEventListener('change', setRows, false);
	rows.addEventListener('keyup', setRows, false);

	cols.addEventListener('change', setCols, false);
	cols.addEventListener('keyup', setCols, false);

	rnd.addEventListener('click', randomize, false);

	table.addEventListener('click', onClick, false);

	function clearSelection() {
		Array.prototype.forEach.call(table.querySelectorAll('tr'), function clearRow(tr) {
			Array.prototype.forEach.call(tr.querySelectorAll('td'), function clearCell(td) {
				td.className = '';
			});
		});
	}

	function setSelection(cells) {
		cells.forEach(function(position) {
			var cell = table.querySelector('tr:nth-child(' + (position[0] + 1) + ') td:nth-child(' + (position[1] + 1) + ')');
			if (!cell) {
				return;
			}
			cell.className = 'related';
		});
	}

	function serializeData() {
		return Array.prototype.reduce.call(table.querySelectorAll('tr'), function clearRow(data, tr) {
			var row = Array.prototype.reduce.call(tr.querySelectorAll('td'), function clearCell(row, td) {
				var input = td.querySelector('input'),
					value = parseInt(input, 10);

				if (isNaN(value)) {
					value = 0;
				}

				row.push(value);
				return row;
			}, []);

			data.push(row);
			return data;
		}, []);
	}

	function onClick(e) {
		var input = e.target,
			position = [];

		if (
			input.nodeType !== 1 ||
			input.nodeName !== 'INPUT'
		) {
			return;
		}

		clearSelection();

		input.parentNode.className = 'initial';

		position[0] = getNodeIndex(input.parentNode.parentNode);
		position[1] = getNodeIndex(input.parentNode);

		calculate(position, serializeData(), setSelection);
	}

	function getRowsCount() {
		if (!rows) {
			return 0;
		}
		var rowsCount = parseInt(rows.value, 10);

		if (
			!rowsCount ||
			rowsCount < 0
		) {
			rowsCount = 0;
		}
		rows.value = rowsCount;

		return rowsCount;
	}

	function getColsCount() {
		if (!cols) {
			return 0;
		}
		var colsCount = parseInt(cols.value, 10);

		if (
			!colsCount ||
			colsCount < 0
		) {
			colsCount = 0;
		}
		cols.value = colsCount;

		return colsCount;
	}

	function generateCol() {
		var td = document.createElement('td'),
			input = document.createElement('input');

		input.type = 'text';
		input.size = 1;

		td.appendChild(input);

		return td;
	}

	function generateRow() {
		var tr = document.createElement('tr'),
			colsCount = getColsCount(),
			i;

		for (i = 0; i < colsCount; i++) {
			tr.appendChild(generateCol());
		}

		return tr;
	}

	function setRows() {
		var rowsCount = getRowsCount(),
			nowRows = table.querySelectorAll('tr').length;

		while (rowsCount !== nowRows) {
			if (rowsCount > nowRows) {
				table.appendChild(generateRow());
				nowRows++;
			}
			if (rowsCount < nowRows) {
				table.removeChild(table.lastChild);
				nowRows--;
			}
		}
	}

	function setCols() {
		var colsCount = getColsCount(),
			trs = table.querySelectorAll('tr');

		Array.prototype.forEach.call(trs, function changeCols(tr) {
			var nowCols = tr.querySelectorAll('td').length;

			while (colsCount !== nowCols) {
				if (colsCount > nowCols) {
					tr.appendChild(generateCol());
					nowCols++;
				}
				if (colsCount < nowCols) {
					tr.removeChild(tr.lastChild);
					nowCols--;
				}
			}
		});
	}

	function setData(data) {
		rows.value = data.length;
		setRows();

		if (Array.isArray(data[0])) {
			cols.value = data[0].length;
			setCols();
		}

		data.forEach(function fillRows(row, i) {
			var tr = table.querySelectorAll('tr')[i];
			if (!tr) {
				return;
			}
			row.forEach(function(val, j) {
				var td = tr.querySelectorAll('td')[j];
				if (!td) {
					return;
				}
				td.firstChild.value = val;
			});
		});
	}

	function randomize() {
		var data = [],
			rowsCount = getRowsCount(),
			colsCount = getColsCount(),
			i, j, row;
		for (i = 0; i < rowsCount; i++) {
			row = [];
			for (j = 0; j < colsCount; j ++) {
				row.push(Math.floor(Math.random() * MAX_RANDOM_INT) + MIN_RANDOM_INT);
			}
			data.push(row);
		}

		setData(data);
	}
}

var communicator = new Communicator(),
	tableController = new TableController(communicator.trigger),
	myFileReader = new MyFileReader(tableController.setData);

tableController.setCols(INIT_SIZE_X);
tableController.setRows(INIT_SIZE_Y);
 