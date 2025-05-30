import { default as Scope } from '../scope/index.ts';
import { PatternOptions } from './pattern.ts';
import * as acorn from 'acorn';
export interface hoistOptions {
    onlyBlock?: boolean;
}
export declare function hoist(block: acorn.Program | acorn.BlockStatement | acorn.StaticBlock, scope: Scope, options?: hoistOptions): Generator<any, void, any>;
export declare function pattern(node: acorn.Pattern, scope: Scope, options?: PatternOptions): IterableIterator<any>;
export interface CtorOptions {
    construct?: (object: any) => Generator | void;
    superClass?: (...args: any[]) => any;
}
export declare function createFunc(node: acorn.FunctionDeclaration | acorn.FunctionExpression | acorn.ArrowFunctionExpression, scope: Scope, options?: CtorOptions): any;
export declare function createClass(node: acorn.ClassDeclaration | acorn.ClassExpression, scope: Scope): Generator<any, () => Generator<any, any, any>, any>;
export interface ForXHandlerOptions {
    value: any;
}
export declare function ForXHandler(node: acorn.ForInStatement | acorn.ForOfStatement, scope: Scope, options: ForXHandlerOptions): Generator<any, any, any>;
