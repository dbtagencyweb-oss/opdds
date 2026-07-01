# Mapa de audios no cPanel

Os audios do livro devem ficar em `public_html/media/audios/livro/`.

No admin, use sempre o caminho publico iniciado por `/media/`.

Exemplo:

```txt
public_html/media/audios/livro/pilar-01-reconhecimento/p1-manifesto.wav
```

No campo do admin:

```txt
/media/audios/livro/pilar-01-reconhecimento/p1-manifesto.wav
```

## Faixas padrao por pilar

Cada pilar segue o mesmo padrao:

```txt
pX-limiar.wav
pX-manifesto.wav
pX-narrativa.wav
pX-conciencia.wav
pX-julgamento.wav
pX-presenca.wav
pX-ancora.wav
pX-carta.wav
```

`pX` muda conforme o pilar:

```txt
p1 -> pilar-01-reconhecimento
p2 -> pilar-02-familia
p3 -> pilar-03-vinculo
p4 -> pilar-04-luto
p5 -> pilar-05-trabalho
p6 -> pilar-06-relacionamento
p7 -> pilar-07-fuga
p8 -> pilar-08-fe
p9 -> pilar-09-continuidade
```

Alguns arquivos sao placeholders silenciosos. Para substituir, grave o audio final com o mesmo nome e envie por cima no cPanel.
