main.js : main.ts Ed/*.ts
	tmcat Ed
	node tsc --module commonjs main.ts | tmtac Ed

.PHONY : clean
clean :
	rm ed.js
