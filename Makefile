main.js : main.ts Ed/*.ts
	tmcat Ed -c "node tsc --module commonjs main.ts"

.PHONY : clean
clean :
	rm ed.js
