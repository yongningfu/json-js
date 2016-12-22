var stringify = function (argument) {
	var result = '{';
	if (argument instanceof Object) {
		
		for (let attr in argument) {
			result += '"' + attr + '":';

			if (argument[attr] instanceof Object) {

				if (argument[attr] instanceof Array) {

					let tempArray = "["
					argument[attr].forEach(function(element) {
						if (element instanceof Object) {
							tempArray += stringify(element)
						} else {
							tempArray += element
						}
						tempArray += ","
					})

					tempArray = tempArray.substring(0, tempArray.length - 1)
					tempArray += "]"
					result += tempArray

				} else {
					result += stringify(argument[attr])
				}
			} else {
				result += argument[attr];
			}

			result += ","
		}

		//去掉最后一个 逗号
		result = result.substring(0, result.length - 1)
		result += "}"
		return result
	} else {
		throw "must be an object"
	}
}

var json = stringify({attr1: 11, attr2: {attr3: 33, attr4: 44, attr5: {attr6: 66, attr7: 77, attr8:[88, 11, {attr9: [22, 33, 44, 55]}]}}})
var parseJson = JSON.parse(json)
console.log(parseJson)




//这个是用来做的对称符号的  比如 'aaa { {aaa{  a}}}  {aaaa}'
//找到 第一个 { 对应的 } 位置
function findSymmetricSymbol(targetString, startIndex, leftSymbol, rightSymbol) {

	if (targetString.charAt(startIndex) !== leftSymbol) {
		throw 'argument error'
	}

	var stack = [] // 这个栈是用来 寻找 左符号的  对应的 右符号 不断入栈 出栈
	for (var i = startIndex; i < targetString.length; i++) {

		if (targetString[i] === leftSymbol)
			stack.push(leftSymbol)
		else if (targetString[i] === rightSymbol) {
			stack.pop()
			if (stack.length === 0) {
				return i
			}
		}
	}	
	return -1
}

//console.log(findSymmetricSymbol("{{aaaaa{{aaaaa{{{aaa}}aa}}aa}}a}", 7, '{', '}'))




var parse = function(argument) {

	if (typeof (argument) !== "string") {
		throw "must be a string"
	}

	//去掉所有的空格
	argument = argument.replace(/\s/g, "")
	
	return function innerParse(argument) {

		//第一个括号对于的对象 每个括号生成一个对象
		var result = {}
		var tempKey = null

		//从 1 开始 0固定为 { 即 result对象
		for (var i = 1; i < argument.length; i++) {

			//取key
			if (argument[i] === '"') {
			    var keyStartIndex = i
				var keyEndIndex = argument.indexOf('"', i + 1)
				tempKey = argument.substring(keyStartIndex + 1, keyEndIndex)
				i = keyEndIndex
			}


			if (argument[i] === ':') {
				
				//取value
				if (argument[i + 1] == '{') {

					//递归 生成对象
					var leftBracket = i + 1
					var rightBracket = findSymmetricSymbol(argument, i + 1, '{', '}')
					childrenObjString = argument.substring(leftBracket, rightBracket + 1)

					result[tempKey] = innerParse(childrenObjString)
					i = rightBracket

				} else {

					var valueEndIndex = argument.indexOf(',', i)
					//防止末尾没有 , 的情况
					if (valueEndIndex != -1) {
						result[tempKey] = argument.substring(i + 1, valueEndIndex)
						i = valueEndIndex
					} else {
						//末尾 没有 逗号
						result[tempKey] = argument.substring(i + 1, argument.length - 1)
						i = argument.length
					}
				}
			}
		}

		return result
	}(argument)
}

var testA = '{"aa" :{"bb":11, "ee":  {"ff":33, "gg":{"dd":22, "ee": {"ff":33}}, "ee":33}}, "cc"  : {"dd":22, "ee":  {"ff":33}}}'

console.log(parse(testA).aa.ee.gg)

console.log(JSON.parse(testA))

// console.log(parse(json))



