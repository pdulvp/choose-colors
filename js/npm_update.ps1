
Rename-Item -Path "C:\Users\dulph\AppData\Roaming\npm\node_modules\@pdulvp" -NewName "@pdulvp_"
npm update 
Rename-Item -Path "C:\Users\dulph\AppData\Roaming\npm\node_modules\@pdulvp_" -NewName "@pdulvp"

Get-ChildItem -Directory C:\Works\sub-modules -Filter * |
	ForEach-Object {
	  echo "Link: @pdulvp/$_"
	  npm link "$_"
   }