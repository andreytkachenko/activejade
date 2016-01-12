# ActiveJade
[activejade.org](http://www.activejade.org)
The main difference with original Jade is that this version is targeted to work in tandem with MVVM framework like AngularJs.
The compiler compiles jade template into JS file instead HTML, and you can link this template on your page and use it as a regular AngularJs's template.

## What Have Done and What Is In Progress

### Done
1. Tags, Attributes, Text, Expressions
2. Mixins
3. Decorators
4. Include
5. IfElse, While, ForIn, CaseWhen

### In Progress
1. Extends, Blocks
2. Filters, IncludeFilters
3. AngularJs ecosystem integration

## Differences Between Original Jade
1. It's parser and lexer completely rewritten based on `Jison`
2. It also parsing JavaScript expressions
3. It has extended JavaScript expression syntax:
    1. array range generator operator ".." (i.e. `7..9 => [ 7, 8, 9 ]`)
    2. euclid operator "?." (i.e. `a.b?.c => (a.b||{}).c` )
    3. slicing operator "\[:\]" (i.e. `[ 1, 2, 3, 4 ][1:2] => [ 2, 3 ]`)
    4. different behavior of var operator
4. It has decorators:
```
div
    @On('click', a += 1)
    div
        span Test
```
5. Statement operator allowing only `var` and `delete` operations (originally was allowed plain JavaScript)
6. Include changes (and probably extends too):
    1. optional `with` statement (for isolating scope)
    2. source parameter may be an expression
