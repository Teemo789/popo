using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebSockets.Infrastructure;
using System;
using System.Text.Json;
using System.Threading.Tasks;

public class WebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMessageService _messageService;

    public WebSocketMiddleware(RequestDelegate next, IMessageService messageService)
    {
        _next = next;
        _messageService = messageService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            var token = context.Request.Query["token"].ToString();
            var userId = GetUserIdFromToken(token);
            
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            await HandleWebSocket(webSocket, userId);
        }
        else
        {
            await _next(context);
        }
    }

    private async Task HandleWebSocket(WebSocket webSocket, string userId)
    {
        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                var message = await ReceiveMessage(webSocket);
                if (message != null)
                {
                    var data = JsonSerializer.Deserialize<WebSocketMessage>(message);
                    
                    if (data.Type == "SEND_MESSAGE")
                    {
                        // Sauvegarder le message
                        var savedMessage = await _messageService.SaveMessage(data);
                        
                        // Envoyer le message à tous les clients concernés
                        await BroadcastMessage(savedMessage);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur WebSocket: {ex.Message}");
        }
    }
} 