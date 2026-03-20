const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    fullName: {type:String, required:true},
    email: {type:String,required:true,unique:true},
    password : {type:String,required:true},
    profileImageUrl: {type:String,default:""},
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    }, {timestamps: true });

// Hashing the password before saving
UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password,10);
});

// Compare Passwords before login
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword,this.password);
}

module.exports = mongoose.model('User',UserSchema);