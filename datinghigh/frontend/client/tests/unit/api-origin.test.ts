import{it,expect}from'vitest';import{defaultApiOrigin}from'../../src/api-origin';
it('PF-UT-083 local iOS simulator and Web use host loopback while Android uses its host alias',()=>{
 expect(defaultApiOrigin('ios')).toBe('http://localhost:8787');expect(defaultApiOrigin('web')).toBe('http://localhost:8787');expect(defaultApiOrigin('android')).toBe('http://10.0.2.2:8787');
});
