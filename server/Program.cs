using server.Model;
using server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ChatRoomManager>();

builder.Services.AddDbContext<GossContext>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<MessageService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });

    options.AddPolicy("ProdPolicy", policy =>
    {
        policy
            .WithOrigins(
                "https://your-production-domain.com",
                "https://app.yourdomain.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5248, listenOptions =>
    {
        listenOptions.UseHttps("server.pfx", "dev123");
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options => 
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });

    app.UseCors("DevPolicy");
}
else
{
    app.UseCors("ProdPolicy");
}

app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/chat");

app.Run();