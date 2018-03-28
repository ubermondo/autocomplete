export const HASHTAG = 1;
export const PERSON = 2;
export const RELATION = 3;
export const HASHTAG_TRIGGER = '#';
export const PERSON_TRIGGER = '@';
export const RELATION_TRIGGER = '<>';
export const HASHTAG_REG_EX = /^#/;
export const PERSON_REG_EX = /^@/;
export const RELATION_REG_EX = /^<>/;
export const triggerByType = (type) => {
  switch (type) {
    case HASHTAG:
      return HASHTAG_TRIGGER;
    case PERSON:
      return PERSON_TRIGGER;
    default:
      return RELATION_TRIGGER;
  }
};
export const regExByType = (type) => {
  switch (type) {
    case HASHTAG:
      return HASHTAG_REG_EX;
    case PERSON:
      return PERSON_REG_EX;
    default:
      return RELATION_REG_EX;
  }
};
