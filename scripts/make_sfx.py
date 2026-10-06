import numpy as np, wave, sys, os
SR=44100; out=sys.argv[1]; rng=np.random.default_rng(1)
def save(name,x):
    x=x/ (np.abs(x).max()+1e-9)*0.9
    x=np.concatenate([x,np.zeros(int(0.02*SR))])
    w=wave.open(os.path.join(out,name+".wav"),"wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
def t(d): return np.arange(int(d*SR))/SR
def bandsweep(noise,f0,f1,q=0.35):
    # time-varying bandpass via STFT-frame filtering
    n=len(noise); hop=256; win=1024; y=np.zeros(n+win); W=np.hanning(win)
    freqs=np.fft.rfftfreq(win,1/SR)
    for i in range(0,n-win,hop):
        f=f0*(f1/f0)**(i/max(1,n-win))
        X=np.fft.rfft(noise[i:i+win]*W)
        H=np.exp(-((np.log(freqs+1)-np.log(f))**2)/(2*q**2))
        y[i:i+win]+=np.fft.irfft(X*H)*W
    return y[:n]
def env(n,a,r):
    e=np.ones(n); A=int(a*SR); e[:A]=np.linspace(0,1,A)**2
    e[A:]=np.exp(-np.linspace(0,1,n-A)*r); return e
# whoosh in (rising) and out (falling)
d=0.45; nz=rng.standard_normal(int(d*SR))
e=np.sin(np.linspace(0,np.pi,len(nz)))**2
save("whoosh_in", bandsweep(nz,300,4000)*e)
save("whoosh_out", bandsweep(nz,4000,300)*e)
# pop
tt=t(0.14); f=np.linspace(900,260,len(tt)); ph=2*np.pi*np.cumsum(f)/SR
save("pop", np.sin(ph)*np.exp(-tt*35))
# click
tt=t(0.06); save("click", (rng.standard_normal(len(tt))*np.exp(-tt*180)+np.sin(2*np.pi*2200*tt)*np.exp(-tt*90)*0.6))
# ding (bell)
tt=t(1.1); save("ding", sum(a*np.sin(2*np.pi*f*tt)*np.exp(-tt*k) for f,a,k in [(1318,1,4),(2637,0.5,6),(3951,0.25,9),(1976,0.3,5)]))
# impact / boom
tt=t(0.7); f=np.linspace(110,40,len(tt)); ph=2*np.pi*np.cumsum(f)/SR
save("boom", np.sin(ph)*np.exp(-tt*6)+rng.standard_normal(len(tt))*np.exp(-tt*40)*0.3)
# sparkle / shine
tt=t(0.6); x=np.zeros(len(tt))
for k,fr in enumerate([2093,2637,3136,4186]):
    s=int(k*0.07*SR); u=tt[:len(tt)-s]; x[s:]+=np.sin(2*np.pi*fr*u)*np.exp(-u*9)
save("sparkle", x)
# swipe (short, for b-roll transitions)
d=0.3; nz=rng.standard_normal(int(d*SR)); e=np.sin(np.linspace(0,np.pi,len(nz)))**3
save("swipe", bandsweep(nz,800,6000,0.5)*e)
# soft tick for each new caption line
tt=t(0.05); save("tick", np.sin(2*np.pi*1600*tt)*np.exp(-tt*120)+rng.standard_normal(len(tt))*np.exp(-tt*300)*0.4)
# higher bubbly pop for labels / titles
tt=t(0.12); f=np.linspace(1400,500,len(tt)); ph=2*np.pi*np.cumsum(f)/SR
save("pop2", np.sin(ph)*np.exp(-tt*40))
# short blip for counter steps
tt=t(0.035); save("blip", np.sin(2*np.pi*2400*tt)*np.exp(-tt*90))
