import {it,expect} from 'vitest';import {parseStrictJson} from '../src/strict-json';
it('PF-UT-067 rejects duplicate keys at every depth including escaped equivalents',()=>{
 for(const input of ['{"owner":"a","owner":"b"}','{"entries":[{"cv":1,"cv":2}]}','{"a":1,"\\u0061":2}','{"a":1,}','[1,]','{}false'])expect(()=>parseStrictJson(input)).toThrow();
 expect(parseStrictJson('{"a":[1,true,null,"x\\\"y"],"b":{}}')).toEqual({a:[1,true,null,'x"y'],b:{}});
});
it('bounded content depth can exceed the HTTP default without accepting duplicate keys or unlimited nesting',()=>{
 const deep='{"a":'.repeat(10)+'1'+'}'.repeat(10);
 expect(()=>parseStrictJson(deep)).toThrow();expect(()=>parseStrictJson(deep,24)).not.toThrow();
 expect(()=>parseStrictJson('{"a":'.repeat(10)+'{"x":1,"x":2}'+'}'.repeat(10),24)).toThrow();
 expect(()=>parseStrictJson(deep,1000)).toThrow();
});
