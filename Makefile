ed.js : *.ts
	node tsc ed.ts --out ed.js

.PHONY : clean
clean :
	rm ed.js
