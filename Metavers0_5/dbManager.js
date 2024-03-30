

let data = [];
//Remplacer tout ça par Node.js
function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                data[0] = allText;
            }
        }
    }
    rawFile.send(null);
}




readTextFile("./database.db");

function dataFromDB(text,n){
	players = ["golto","julosolong"];
	
	index = text.search(players[n]);
	lenIndex = players[n].length;

	playerPos = text.slice(index + lenIndex + 13 , index + lenIndex + 13 + 3 );
	console.log(playerPos)
}


