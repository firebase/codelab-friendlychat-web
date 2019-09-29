// export const autoExpand = (field) => {
//
// 	// Reset field height
// 	field.style.height = 'inherit';
//
// 	// Get the computed styles for the element
// 	const computed = window.getComputedStyle(field);
//
// 	// Calculate the height
// 	const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
// 	             + parseInt(computed.getPropertyValue('padding-top'), 10)
// 	             + field.scrollHeight
// 	             + parseInt(computed.getPropertyValue('padding-bottom'), 10)
// 	             + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
//
// 	field.style.height = height + 'px';
//
// };

export function throttling(callback, delay) {
	let timeout = null
	return function(...args) {
		if (!timeout) {
			timeout = setTimeout(() => {
				callback.call(this, ...args)
				timeout = null
			}, delay)
		}
	}
}

export function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
  };
};

export function goFetch(uri, inputOptions) {
	const { headers, ...extraOpts } = inputOptions || {};
	const options = {
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
			...(headers || {})
		},
		mode: "cors",
		...extraOpts
	}
	return fetch(uri, options)
	.then(response => {
		if (!response.ok) {
			const err = new Error(response.statusText);
			err.res = response;
			throw err;
		} else {
			return response.json();
		}
	})
	.catch(err => {
		return err;
	});
};

export function removeSpecials(str) {
  const lower = str.toLowerCase();
  const upper = str.toUpperCase();
  let res = "";
  for (let i = 0; i < lower.length; ++i) {
    if (lower[i] != upper[i] || lower[i] === ' ' || lower[i] === '_' || lower[i].trim() === '.')
		res += str[i];
  }
  return res;
}
