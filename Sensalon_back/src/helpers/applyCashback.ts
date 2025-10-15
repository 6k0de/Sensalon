
import { CashBack } from "../bd/models/Cashback.model";
import { CashBackConf } from "../bd/models/CashbackConf.model";
import { TransactionModel } from "../bd/models/Transaction.model";
import { Users } from "../bd/models/Users.model";

export const applyCashback = async (transaction: any, user: any) => {
    const cashbackConf = await CashBackConf.findOne();
    if (!cashbackConf) return;

    console.log("transaction y user", { transaction, user });
    const amount = Number(transaction.amount);
    const perc = Number(cashbackConf.get('cashbackpercentage'));
    const cbAmount = +(amount * (perc / 100)).toFixed(2);
    const roleEligible = user.iFIdRole === "8337416f-7177-11ef-a9b1-0050563b";
    if (!roleEligible) return;

    const existing = await CashBack.findOne({
        where: { FiIdUser: user.iIdUser, FiIdTransaction: transaction.iIdTransaction },
    });
    console.log("existing", existing);

    if (existing) {
        const prev = Number(existing.get('cashbackamount') || 0);
        await existing.update({ cashbackamount: +(prev + cbAmount).toFixed(2) });
    } else {
        await CashBack.create({
            FiIdUser: user.iIdUser!,
            FiIdTransaction: transaction.iIdTransaction,
            cashbackamount: cbAmount,
            createdAt: new Date(),
        });
    }
    console.log("cashbackAmount", cbAmount);
    await Users.increment('cashbackbalance', {
        by: cbAmount,
        where: { iIdUser: user.iIdUser },
    });
    await TransactionModel.update({ cashbackapplied: 1 }, { where: { iIdTransaction: transaction.iIdTransaction } });
};
