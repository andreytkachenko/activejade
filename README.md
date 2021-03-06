# ActiveJade
[activejade.org](http://www.activejade.org)
The main difference with original Jade is that this version is targeted to work in tandem with MVVM framework like AngularJs.
The compiler compiles jade template into JS file instead HTML, and you can link this template on your page and use it as a regular AngularJs's template.

## What Have Done and What Is In Progress

### Done
1. Tags, Attributes, Text, Expressions
2. Mixin Declare, Mixin Call
3. Decorators
4. Include
5. IfElse, While, ForIn, CaseWhen
6. References and promises
7. Except Statement

### In Progress
1. Extends, Blocks
2. Filters, IncludeFilters
3. AngularJs ecosystem integration
4. Tests: port from original Jade and tests to check proper DOM manipulations

### Plans on Future
1. `break` and `continue` statements

## Differences Between Original Jade
1. It's parser and lexer completely rewritten based on `Jison`
2. It has extended JavaScript expression syntax (since in is parsing JavaScript as well):
    * array range generator operator `..` (i.e. `7..9` => `[ 7, 8, 9 ]`)
    * euclid operator `?.` (i.e. `a.b?.c` => `(a.b||{}).c` )
    * slicing operator `[:]` (i.e. `[ 1, 2, 3, 4 ][1:2]` => `[ 2, 3 ]`)
    * different behavior of `var` operator
    * may have `#element-id` to access to element by id:
```
	div#test-1
	... some code
	- #test-1.innerHTML = #test-n.innerHTML
	... some code
	div#test-n
```
3. It has decorators(can be applied to tags or mixin calls):
```
div
    @On('click', a += 1)
    div
        span Test
```
Or
```
div
    @On('click', a += 1)
    +awesome-button("green") Press Me
```
4. `for` loop:
    * may have `if` clause:
		```
		div
			for k, chbx in checkboxes if chbx.checked
				span #{k} is checked
		```
	* may have `else` clause:
		```
		div
			for v in test
				a= v
			else
				div No Items
		```

5. Statement operator allowing only `var` and `delete` operations (originally was allowed plain JavaScript)
6. `include` changes:
    * optional `with` statement (for isolating scope)
    * source parameter may be an expression (`extend` will have it too)
7. `for`, `if`, `while`, `case` and `include` statements may have optional `except` statement:
```
if test
	div OK
except
	wait
		div The promise is still not resolved!
	error msg
		div Oh! Promise was rejected with message: #{msg}
```
For `include` the `except` statement has different syntax:
```
include promise
	wait
		div Please wait...
```

## Standard Decorators
1. `@on` - to attach event listener to tag element
