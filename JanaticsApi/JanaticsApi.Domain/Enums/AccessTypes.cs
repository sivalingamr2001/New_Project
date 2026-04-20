using System.ComponentModel;

namespace Janatics.Domain.Enums;

public enum AccessTypes
{
    [Description("Not Applicable")]
    NotApplicable = 0,

    [Description("Read Only")]
    ReadOnly = 1,

    [Description("Read & Write")]
    ReadAndWrite = 2
}
