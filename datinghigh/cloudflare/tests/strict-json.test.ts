import {it,expect} from 'vitest';import {parseStrictJson} from '../src/strict-json';
it('PF-UT-067 rejects duplicate keys at every depth including escaped equivalents',()=>{
 for(const input of ['{"owner":"a","owner":"b"}','{"entries":[{"cv":1,"cv":2}]}','{"a":1,"\\u0061":2}','{"a":1,}','[1,]','{}false'])expect(()=>parseStrictJson(input)).toThrow();
 expect(parseStrictJson('{"a":[1,true,null,"x\\\"y"],"b":{}}')).toEqual({a:[1,true,null,'x"y'],b:{}});
});
