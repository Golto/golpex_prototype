
async function promptLLM(input){
	const res = await query({"inputs": input})
	return res[0].generated_text.replace(' ','')
}


const characters = {
	Jarvis : {
		identity : "Name : Jarvis, Likes : Films, History\n",
		job : "Job : Historian\n",
		context : "Context : You have a conversation with Tensa, you don't appreciate Vecto.\n",
		memorySize : 5,
	},
	Tensa : {
		identity : "Name : Tensa, Likes : Books, Animals\n",
		job : "Job : Story writer",
		context : "Context : You have a conversation with Jarvis, you appreciate Vecto.\n",
		memorySize : 10,
	},
	Vecto : {
		identity : "",
		job : "",
		context : "",
		memorySize : 10,
	},
	Polyne : {
		identity : "",
		job : "",
		context : "",
		memorySize : 10,
	},
	Matricia : {
		identity : "",
		job : "",
		context : "",
		memorySize : 10,
	},	
}


async function LLM_Jarvis(input){
	let prompt = characters.Jarvis.identity + characters.Jarvis.job + characters.Jarvis.context;
	prompt += "\nTopic :";
	res = await promptLLM(prompt);
	output = outputExtractor(prompt, res)
	return output
}




/*
Name : Tensa
Likes : Books, Animals
Job : Story writer
Context : You have a conversation with Jarvis, you appreciate Vecto.

Tensa : Hey Jarvis, want to talk ?
Jarvis : No thanks, I'm busy.
Tensa : Oh, okay.
Jarvis : Hey, Tensa.
Tensa : Hey, Jarvis.
Jarvis : What are you doing?
Tensa : I'm writing a story.
Jarvis : Oh, cool.
Tensa : Yeah, it's about a girl who loves animals.
Jarvis : Oh, cool.
Tensa :
Yeah, it's about a girl who loves animals.



Name : Jarvis
Likes : Films, History
Job : Historian
Context : You have a conversation with Tensa, you don't appreciate Vecto.
Tensa : Hey Jarvis, want to talk ?
Jarvis : No thanks, I'm busy.
Tensa : Oh, okay.
Jarvis : Hey, Tensa.
Tensa : Hey, Jarvis.
Jarvis : What are you doing?
Tensa : I'm writing a story.
Jarvis : Oh, cool.
Tensa : Yeah, it's about a girl who loves animals.
Jarvis : Oh, cool.
Tensa :
Yeah, it's about a girl who loves animals.

// Pour éviter les boucles infini de répétitions, rajouter une ligne NAME can't say PREVIOUS_SENTENCE









Name : Jarvis
Likes : Films, History
Job : Historian
Context : You have a conversation with Tensa, you don't appreciate Vecto.
<discussion>Tensa : Hey Jarvis, want to talk ?
Jarvis :
No thanks, I'm busy.   <--------- Faire une fonction d'oubli avec LLM ou simple array.pop
Tensa :
Oh, okay.
Jarvis :
I have a job interview tomorrow.
Tensa :
Good luck.
Jarvis :
Thanks.   <--------- faire un capteur pour savoir si la discussion doit se finir


Name : Tensa
Likes : Books, Animals
Job : Story writer
Context : You have a conversation with Jarvis, you appreciate Vecto.
<discussion>Tensa : Hey Jarvis, want to talk ?
Jarvis :
No thanks, I'm busy.
Tensa :
Oh, okay.
Jarvis :
I have a job interview tomorrow.
Tensa :
Good luck.
Jarvis :
Thanks. 
Tensa :
I have a job interview tomorrow too.











<context start>
Name : Tensa
Likes : Books, Animals
Job : Story writer
Context : You have a conversation with Jarvis, you appreciate Vecto.
<context end>
<discussion start>
Tensa : Hey Jarvis, do you want to talk ?
Jarvis : Yeah why not ?
Tensa :
I like Vecto.
Jarvis :
I don't.
Tensa :
I like him a lot.
Jarvis :
I don't know why.
Tensa :
I think he's very nice.
Jarvis :
I don't know.
Tensa :
I think he's very nice.
Jarvis :
I don't know.


<context start>
Name : Jarvis
Likes : Films, History
Job : Historian
Context : You have a conversation with Tensa, you don't appreciate Vecto.
<context end>
<discussion start>
Tensa : Hey Jarvis, do you want to talk ?
Jarvis : Yeah why not ?
Tensa :
I like Vecto.
Jarvis :
I don't.
Tensa :
I like him a lot.
Jarvis :
I don't know why.
Tensa :
I think he's very nice.
Jarvis :
I don't know.
*/