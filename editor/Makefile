main.js : main.ts Ed/*.ts
	tmcat Ed -c "tsc --module commonjs main.ts"

test.js : test.ts
	tmcat Ed -c "tsc --module commonjs test.ts"

.PHONY : clean
clean :
	rm ed.js
