const fs = require('fs');
const filePath = '/src/components/RocketBullGame.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Regex para encontrar la estructura de login button:
// 3557:                         <span className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest leading-none">
// 3558:                           {isSigningIn ? 'Connecting...' : 'Connect'}
// 3559:                         </span>
// 3560:                      </button>
// 3561:                    )}
const regex = /\{\s*isSigningIn\s*\?\s*['"]Connecting\.\.\.['"]\s*:\s*['"]Connect['"][\s\S]*?<\/button>\s*\}\s*\)/i;

const match = content.match(regex);
if (match) {
  console.log("Found match!");
  const matchedText = match[0];
  const matchedIndex = content.indexOf(matchedText);
  const insertIndex = matchedIndex + matchedText.length;
  
  const beforeSegment = content.slice(0, insertIndex);
  const afterSegment = content.slice(insertIndex);
  
  const miniMusicWidget = `

                    {/* Mini control de música de fondo personalizada súper accesible */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md shadow-md animate-fade-in">
                      <Music className={\`w-2.5 h-2.5 sm:w-3 sm:h-3 \${customMusicId ? 'text-cyan-400 animate-pulse' : 'text-gray-400'}\`} />
                      <input 
                        type="text" 
                        value={tempMusicId}
                        onChange={(e) => setTempMusicId(e.target.value)}
                        placeholder="Música ID..."
                        className="bg-transparent border-none text-white font-mono text-[8px] sm:text-[10px] w-12 sm:w-20 focus:outline-none placeholder-gray-500 leading-none py-0 select-text"
                      />
                      <button 
                        onClick={() => handleCustomMusicIdChange(tempMusicId)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[7px] sm:text-[8px] uppercase px-1.5 py-0.5 rounded-full transition-all cursor-pointer active:scale-95 leading-none shrink-0 font-sans"
                        title="Poner música"
                      >
                        Poner
                      </button>
                      {customMusicId && (
                        <button 
                          onClick={() => {
                            setTempMusicId('');
                            handleCustomMusicIdChange('');
                          }}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-100 font-extrabold text-[8px] px-1 sm:px-1.5 py-0.5 rounded-full transition-all cursor-pointer leading-none"
                          title="Quitar música"
                        >
                          ✕
                        </button>
                      )}
                    </div>`;
                    
  fs.writeFileSync(filePath, beforeSegment + miniMusicWidget + afterSegment, 'utf8');
  console.log("Replaced!");
} else {
  // Let us try another fallback regex to search for the text and edit it
  const secondRegex = /isSigningIn\s*\?\s*['"]Connecting\.\.\.['"]\s*:\s*['"]Connect['"]/i;
  const secondMatch = content.match(secondRegex);
  if (secondMatch) {
    console.log("Found second match (Connect text)");
    const targetIdx = content.indexOf('</button>', secondMatch.index);
    if (targetIdx !== -1) {
      const buttonEndLength = '</button>'.length;
      let closingParenIdx = content.indexOf(')}', targetIdx + buttonEndLength);
      if (closingParenIdx !== -1) {
        const offset = closingParenIdx + ')}'.length;
        const beforeSegment = content.slice(0, offset);
        const afterSegment = content.slice(offset);
        
        const miniMusicWidget = `

                    {/* Mini control de música de fondo personalizada súper accesible */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md shadow-md animate-fade-in">
                      <Music className={\`w-2.5 h-2.5 sm:w-3 sm:h-3 \${customMusicId ? 'text-cyan-400 animate-pulse' : 'text-gray-400'}\`} />
                      <input 
                        type="text" 
                        value={tempMusicId}
                        onChange={(e) => setTempMusicId(e.target.value)}
                        placeholder="Música ID..."
                        className="bg-transparent border-none text-white font-mono text-[8px] sm:text-[10px] w-12 sm:w-20 focus:outline-none placeholder-gray-500 leading-none py-0 select-text"
                      />
                      <button 
                        onClick={() => handleCustomMusicIdChange(tempMusicId)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[7px] sm:text-[8px] uppercase px-1.5 py-0.5 rounded-full transition-all cursor-pointer active:scale-95 leading-none shrink-0 font-sans"
                        title="Poner música"
                      >
                        Poner
                      </button>
                      {customMusicId && (
                        <button 
                          onClick={() => {
                            setTempMusicId('');
                            handleCustomMusicIdChange('');
                          }}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-100 font-extrabold text-[8px] px-1 sm:px-1.5 py-0.5 rounded-full transition-all cursor-pointer leading-none"
                          title="Quitar música"
                        >
                          ✕
                        </button>
                      )}
                    </div>`;
                    
        fs.writeFileSync(filePath, beforeSegment + miniMusicWidget + afterSegment, 'utf8');
        console.log("Replaced with second regex!");
      }
    }
  } else {
    console.log("No regex match found");
  }
}
