export const asyncHandler = (routeFunction)=>{
    return async(req,res,next)=>{
        try{
            await routeFunction(req,res,next);
        }catch(error){
            res.status(err.code || 500).json({
                success:false,
                message:err.message
            })
        }
    }
}

