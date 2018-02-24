#ifdef GL_ES
    precision mediump float;
#endif


varying vec2 vTexCoord;
uniform sampler2D uImage0;

void main()
{
   vec4 sum = vec4(0);
   vec2 texcoord = vTexCoord;
  
   for( int i= -4 ;i < 4; i++)
   {
        for ( int j = -3; j < 3; j++)
        {
            sum += texture2D(uImage0, texcoord + vec2(j, i)*0.004) * 0.25;
        }
   }
       if (texture2D(uImage0, texcoord).r < 0.3)
    {
       gl_FragColor = sum*sum*0.012 + texture2D(uImage0, texcoord);
    }
    else
    {
        if (texture2D(uImage0, texcoord).r < 0.5)
        {
            gl_FragColor = sum*sum*0.009 + texture2D(uImage0, texcoord);
        }
        else
        {
            gl_FragColor = sum*sum*0.0075 + texture2D(uImage0, texcoord);
        }
    }
}