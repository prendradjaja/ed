main.js : main.ts Ed/*.ts
	cat Ed/* > Ed.ts
	node tsc --module commonjs main.ts

.PHONY : clean
clean :
	rm ed.js
