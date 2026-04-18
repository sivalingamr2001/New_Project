namespace Janatics.Domain.Exceptions;

public sealed class AppValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public AppValidationException(string message) : base(message)
        => Errors = new Dictionary<string, string[]>();

    public AppValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation failures have occurred.")
        => Errors = errors;
}

